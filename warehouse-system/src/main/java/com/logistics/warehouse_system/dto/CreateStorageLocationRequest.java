package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStorageLocationRequest(
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 150) String name) {
}
