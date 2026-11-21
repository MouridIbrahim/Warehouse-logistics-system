package com.logistics.warehouse_system.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserDto user) {
}
