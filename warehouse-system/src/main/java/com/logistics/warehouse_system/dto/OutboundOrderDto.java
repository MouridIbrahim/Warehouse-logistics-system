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
        List<OutboundOrderItemDto> items,
        long itemCount) {

    public static OutboundOrderDto summary(OutboundOrder order, long itemCount) {
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
                List.of(),
                itemCount);
    }

    public static OutboundOrderDto detail(OutboundOrder order) {
        List<OutboundOrderItemDto> items = order.getItems().stream().map(OutboundOrderItemDto::from).toList();
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
                items,
                items.size());
    }
}
