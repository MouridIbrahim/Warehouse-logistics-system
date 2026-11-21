package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateInboundOrderItemRequest(
        @NotNull Long productId,
        @NotNull Long storageLocationId,
        @NotNull @Positive Integer receivedQuantity) {
}
