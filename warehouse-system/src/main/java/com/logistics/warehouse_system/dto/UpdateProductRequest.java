package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.Size;

public record UpdateProductRequest(
        @Size(max = 50) String sku,
        @Size(max = 150) String name,
        @Size(max = 2000) String description,
        @Size(max = 50) String unitOfMeasure,
        Boolean active) {
}
