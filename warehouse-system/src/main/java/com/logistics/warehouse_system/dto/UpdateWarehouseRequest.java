package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.Size;

public record UpdateWarehouseRequest(
        @Size(max = 50) String code,
        @Size(max = 150) String name,
        @Size(max = 255) String address,
        Boolean active) {
}
