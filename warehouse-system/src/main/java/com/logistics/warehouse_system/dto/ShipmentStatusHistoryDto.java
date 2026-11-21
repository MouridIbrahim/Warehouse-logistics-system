package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.ShipmentStatusHistory;

import java.time.Instant;

public record ShipmentStatusHistoryDto(
        Long id,
        String previousStatus,
        String newStatus,
        Long changedById,
        String changedByName,
        Instant changedAt,
        String note) {

    public static ShipmentStatusHistoryDto from(ShipmentStatusHistory history) {
        return new ShipmentStatusHistoryDto(
                history.getId(),
                history.getPreviousStatus() == null ? null : history.getPreviousStatus().name(),
                history.getNewStatus().name(),
                history.getChangedBy().getId(),
                history.getChangedBy().getDisplayName(),
                history.getChangedAt(),
                history.getNote());
    }
}
