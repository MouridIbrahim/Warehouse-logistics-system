package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.ChangePasswordRequest;
import com.logistics.warehouse_system.dto.CreateUserRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.RegisterRequest;
import com.logistics.warehouse_system.dto.ResetPasswordRequest;
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
import com.logistics.warehouse_system.security.SecurityUtils;
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
    public PageResponse<UserDto> list(String term, String role, Boolean active, Pageable pageable) {
        Page<User> page = userRepository.search(term, role, active, pageable);
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

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByRoleName("ADMINISTRATOR")) {
            throw new ConflictException(
                    "An administrator already exists. Ask an administrator to create your account.");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already exists: " + request.username());
        }
        Role adminRole = roleRepository.findByName("ADMINISTRATOR")
                .orElseThrow(() -> new IllegalStateException("ADMINISTRATOR role is not seeded"));
        User user = User.builder()
                .username(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .active(true)
                .build();
        user.getRoles().add(adminRole);
        userRepository.save(user);
        auditLogService.record("USER_REGISTERED", "USER", user.getId(), user.getId());
        return UserDto.from(user);
    }

    @Transactional
    public void changeOwnPassword(ChangePasswordRequest request) {
        Long userId = SecurityUtils.currentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        auditLogService.record("PASSWORD_CHANGED", "USER", userId);
    }

    @Transactional
    public void resetPassword(Long userId, ResetPasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        auditLogService.record("PASSWORD_RESET", "USER", userId);
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
