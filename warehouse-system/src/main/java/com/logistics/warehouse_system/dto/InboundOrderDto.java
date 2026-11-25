package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.InboundOrder;

import java.time.Instant;
import java.util.List;

public record InboundOrderDto(
        Long id,
        String referenceNumber,
        Long warehouseId,
        String status,
        Instant receivedAt,
        Long createdById,
        String createdByName,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        List<InboundOrderItemDto> items,
        long itemCount) {

    public static InboundOrderDto summary(InboundOrder order, long itemCount) {
        return new InboundOrderDto(
                order.getId(),
                order.getReferenceNumber(),
                order.getWarehouse().getId(),
                order.getStatus().name(),
                order.getReceivedAt(),
                order.getCreatedBy().getId(),
                order.getCreatedBy().getDisplayName(),
                order.getNotes(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                List.of(),
                itemCount);
    }

    public static InboundOrderDto detail(InboundOrder order) {
        List<InboundOrderItemDto> items = order.getItems().stream().map(InboundOrderItemDto::from).toList();
        return new InboundOrderDto(
                order.getId(),
                order.getReferenceNumber(),
                order.getWarehouse().getId(),
                order.getStatus().name(),
                order.getReceivedAt(),
                order.getCreatedBy().getId(),
                order.getCreatedBy().getDisplayName(),
                order.getNotes(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                items,
                items.size());
    }
}
