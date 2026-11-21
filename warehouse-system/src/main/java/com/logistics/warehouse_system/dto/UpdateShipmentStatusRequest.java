package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateShipmentStatusRequest(
        @NotNull ShipmentStatus status,
        @Size(max = 2000) String note) {
}
