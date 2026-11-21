package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateOutboundOrderItemRequest(
        @NotNull Long productId,
        @NotNull Long storageLocationId,
        @NotNull @Positive Integer requestedQuantity) {
}
