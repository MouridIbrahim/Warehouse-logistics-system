package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.LoginRequest;
import com.logistics.warehouse_system.dto.LoginResponse;
import com.logistics.warehouse_system.dto.UserDto;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.AppUserDetails;
import com.logistics.warehouse_system.security.JwtService;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserRepository userRepository,
                       RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new NotFoundException("User", request.username()));

        if (user.isAccountLocked()) {
            throw new ConflictException("Account is locked. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
            AppUserDetails details = (AppUserDetails) authentication.getPrincipal();
            user.resetFailedAttempts();
            userRepository.save(user);

            String accessToken = jwtService.generateToken(details);
            String refreshToken = refreshTokenService.createRefreshToken(details.getId());
            return new LoginResponse(accessToken, refreshToken, "Bearer", jwtService.getExpirationMs(), UserDto.from(user));
        } catch (Exception e) {
            user.incrementFailedAttempts();
            if (user.getFailedLoginAttempts() >= 5) {
                user.lockAccount(30); // Lock for 30 minutes
            }
            userRepository.save(user);
            throw e;
        }
    }

    @Transactional
    public LoginResponse refresh(String refreshToken) {
        com.logistics.warehouse_system.entities.RefreshToken stored = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new NotFoundException("Refresh token", refreshToken));

        if (!refreshTokenService.isTokenValid(stored)) {
            throw new NotFoundException("Refresh token", "invalid or expired");
        }

        User user = userRepository.findById(stored.getUser().getId())
                .orElseThrow(() -> new NotFoundException("User", stored.getUser().getId()));

        // Revoke old refresh token and create new one (rotation)
        refreshTokenService.revokeToken(refreshToken);
        String newAccessToken = jwtService.generateToken(
                new com.logistics.warehouse_system.security.AppUserDetails(user));
        String newRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new LoginResponse(newAccessToken, newRefreshToken, "Bearer", jwtService.getExpirationMs(),
                UserDto.from(user));
    }

    public UserDto me() {
        Long id = SecurityUtils.currentUserId();
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new NotFoundException("User", id));
        return UserDto.from(user);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenService.revokeAllByUserId(userId);
    }
}
