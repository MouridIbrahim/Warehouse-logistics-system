package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateShipmentRequest(
        @NotBlank @Size(max = 50) String trackingNumber,
        @NotNull Long outboundOrderId,
        @Size(max = 100) String carrierName) {
}
