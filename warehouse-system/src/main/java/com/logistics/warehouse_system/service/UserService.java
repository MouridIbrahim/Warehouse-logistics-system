package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateUserRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.RoleDto;
import com.logistics.warehouse_system.dto.UpdateUserRequest;
import com.logistics.warehouse_system.dto.UserDto;
import com.logistics.warehouse_system.entities.Role;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.RoleRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDto> list(String term, Pageable pageable) {
        Page<User> page = (term == null || term.isBlank())
                ? userRepository.findAll(pageable)
                : userRepository.search(term.trim(), pageable);
        List<UserDto> content = page.getContent().stream().map(UserDto::from).toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public UserDto get(Long id) {
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new NotFoundException("User", id));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto create(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already exists: " + request.username());
        }
        Set<Role> roles = resolveRoles(request.roles());
        User user = User.builder()
                .username(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .active(true)
                .build();
        user.getRoles().addAll(roles);
        userRepository.save(user);
        auditLogService.record("USER_CREATED", "USER", user.getId());
        return UserDto.from(user);
    }

    @Transactional
    public UserDto update(Long id, UpdateUserRequest request) {
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new NotFoundException("User", id));
        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }
        if (request.active() != null) {
            user.setActive(request.active());
        }
        if (request.roles() != null) {
            Set<Role> roles = resolveRoles(request.roles());
            user.getRoles().clear();
            user.getRoles().addAll(roles);
        }
        userRepository.save(user);
        auditLogService.record("USER_UPDATED", "USER", user.getId());
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public List<RoleDto> listRoles() {
        return roleRepository.findAll().stream()
                .map(r -> new RoleDto(r.getId(), r.getName(), r.getDescription()))
                .toList();
    }

    private Set<Role> resolveRoles(List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new BadRequestException("At least one role is required");
        }
        Set<Role> roles = new HashSet<>(roleRepository.findByNameIn(roleNames));
        if (roles.size() != new HashSet<>(roleNames).size()) {
            throw new BadRequestException("One or more roles do not exist");
        }
        return roles;
    }
}
