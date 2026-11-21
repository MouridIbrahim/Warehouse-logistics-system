package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
        @NotBlank @Size(max = 50) String sku,
        @NotBlank @Size(max = 150) String name,
        @Size(max = 2000) String description,
        @Size(max = 50) String unitOfMeasure) {
}
