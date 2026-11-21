package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.Role;
import com.logistics.warehouse_system.entities.User;

import java.time.Instant;
import java.util.List;

public record UserDto(
        Long id,
        String username,
        String displayName,
        boolean active,
        List<String> roles,
        Instant createdAt) {

    public static UserDto from(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .toList();
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.isActive(),
                roles,
                user.getCreatedAt());
    }
}
