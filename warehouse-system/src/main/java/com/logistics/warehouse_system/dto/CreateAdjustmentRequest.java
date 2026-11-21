package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAdjustmentRequest(
        @NotNull Long productId,
        @NotNull Long storageLocationId,
        @NotNull Integer quantityDelta,
        @Size(max = 2000) String notes) {
}
