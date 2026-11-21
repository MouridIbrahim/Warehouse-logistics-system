package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.LoginRequest;
import com.logistics.warehouse_system.dto.LoginResponse;
import com.logistics.warehouse_system.dto.UserDto;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.AppUserDetails;
import com.logistics.warehouse_system.security.JwtService;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        AppUserDetails details = (AppUserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(details);
        User user = userRepository.findByUsernameWithRoles(details.getUsername())
                .orElseThrow(() -> new NotFoundException("User", details.getUsername()));
        return new LoginResponse(token, "Bearer", jwtService.getExpirationMs(), UserDto.from(user));
    }

    public UserDto me() {
        Long id = SecurityUtils.currentUserId();
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new NotFoundException("User", id));
        return UserDto.from(user);
    }
}
