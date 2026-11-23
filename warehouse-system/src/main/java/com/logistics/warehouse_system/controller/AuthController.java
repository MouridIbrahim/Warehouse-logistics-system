package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.ChangePasswordRequest;
import com.logistics.warehouse_system.dto.LoginRequest;
import com.logistics.warehouse_system.dto.LoginResponse;
import com.logistics.warehouse_system.dto.RegisterRequest;
import com.logistics.warehouse_system.dto.UserDto;
import com.logistics.warehouse_system.security.SecurityUtils;
import com.logistics.warehouse_system.service.AuthService;
import com.logistics.warehouse_system.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changeOwnPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request,
                               HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        addRefreshTokenCookie(response, loginResponse.refreshToken());
        return loginResponse;
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
                                 HttpServletResponse response) {
        if (refreshToken == null) {
            throw new RuntimeException("Refresh token cookie not found");
        }
        LoginResponse loginResponse = authService.refresh(refreshToken);
        addRefreshTokenCookie(response, loginResponse.refreshToken());
        return loginResponse;
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        Long userId = SecurityUtils.currentUserId();
        authService.logout(userId);
        clearRefreshTokenCookie(request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserDto me() {
        return authService.me();
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        cookie.setComment("HttpOnly refresh token");
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
                    cookie.setValue("");
                    cookie.setPath("/api/v1/auth");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                    break;
                }
            }
        }
    }
}
