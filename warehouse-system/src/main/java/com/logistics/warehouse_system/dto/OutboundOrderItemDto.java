package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.OutboundOrderItem;

public record OutboundOrderItemDto(
        Long id,
        Long productId,
        String productSku,
        String productName,
        Long storageLocationId,
        String storageLocationCode,
        Integer requestedQuantity) {

    public static OutboundOrderItemDto from(OutboundOrderItem item) {
        return new OutboundOrderItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getSku(),
                item.getProduct().getName(),
                item.getStorageLocation().getId(),
                item.getStorageLocation().getCode(),
                item.getRequestedQuantity());
    }
}
