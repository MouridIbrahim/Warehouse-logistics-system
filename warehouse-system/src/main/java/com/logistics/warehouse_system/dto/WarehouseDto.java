package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.Warehouse;

import java.time.Instant;

public record WarehouseDto(
        Long id,
        String code,
        String name,
        String address,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {

    public static WarehouseDto from(Warehouse warehouse) {
        return new WarehouseDto(
                warehouse.getId(),
                warehouse.getCode(),
                warehouse.getName(),
                warehouse.getAddress(),
                warehouse.isActive(),
                warehouse.getCreatedAt(),
                warehouse.getUpdatedAt());
    }
}
