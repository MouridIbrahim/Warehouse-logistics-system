package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.OutboundOrder;

import java.time.Instant;
import java.util.List;

public record OutboundOrderDto(
        Long id,
        String referenceNumber,
        Long warehouseId,
        String status,
        Instant requestedAt,
        Long createdById,
        String createdByName,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        List<OutboundOrderItemDto> items) {

    public static OutboundOrderDto summary(OutboundOrder order) {
        return new OutboundOrderDto(
                order.getId(),
                order.getReferenceNumber(),
                order.getWarehouse().getId(),
                order.getStatus().name(),
                order.getRequestedAt(),
                order.getCreatedBy().getId(),
                order.getCreatedBy().getDisplayName(),
                order.getNotes(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                List.of());
    }

    public static OutboundOrderDto detail(OutboundOrder order) {
        return new OutboundOrderDto(
                order.getId(),
                order.getReferenceNumber(),
                order.getWarehouse().getId(),
                order.getStatus().name(),
                order.getRequestedAt(),
                order.getCreatedBy().getId(),
                order.getCreatedBy().getDisplayName(),
                order.getNotes(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream().map(OutboundOrderItemDto::from).toList());
    }
}
