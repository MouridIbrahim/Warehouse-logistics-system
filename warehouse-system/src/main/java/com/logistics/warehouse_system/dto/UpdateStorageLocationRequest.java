package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.Size;

public record UpdateStorageLocationRequest(
        @Size(max = 50) String code,
        @Size(max = 150) String name,
        Boolean active) {
}
