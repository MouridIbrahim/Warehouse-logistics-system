package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserId(Long userId);

    boolean existsByUserIdAndRevokedFalseAndExpiresAtAfter(Long userId, Instant now);
}
