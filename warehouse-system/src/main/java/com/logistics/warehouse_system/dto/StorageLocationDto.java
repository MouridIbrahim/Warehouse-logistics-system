package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.StorageLocation;

import java.time.Instant;

public record StorageLocationDto(
        Long id,
        Long warehouseId,
        String code,
        String name,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {

    public static StorageLocationDto from(StorageLocation location, Long warehouseId) {
        return new StorageLocationDto(
                location.getId(),
                warehouseId,
                location.getCode(),
                location.getName(),
                location.isActive(),
                location.getCreatedAt(),
                location.getUpdatedAt());
    }
}
