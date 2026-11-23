package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.entities.RefreshToken;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.repository.RefreshTokenRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               UserRepository userRepository,
                               JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public String createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Revoke all existing refresh tokens for this user
        revokeAllByUserId(userId);

        String tokenValue = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(jwtService.getRefreshExpirationMs() / 1000);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    @Transactional
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            rt.setRevokedAt(Instant.now());
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional
    public void revokeAllByUserId(Long userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findAll().stream()
                .filter(rt -> rt.getUser().getId().equals(userId) && !rt.isRevoked() && !rt.isExpired())
                .toList();
        for (RefreshToken rt : tokens) {
            rt.setRevoked(true);
            rt.setRevokedAt(Instant.now());
        }
        refreshTokenRepository.saveAll(tokens);
    }

    public boolean isTokenValid(RefreshToken refreshToken) {
        return refreshToken != null && !refreshToken.isRevoked() && !refreshToken.isExpired();
    }
}
