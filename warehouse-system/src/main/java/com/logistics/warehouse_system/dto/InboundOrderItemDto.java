package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.InboundOrderItem;

public record InboundOrderItemDto(
        Long id,
        Long productId,
        String productSku,
        String productName,
        Long storageLocationId,
        String storageLocationCode,
        Integer receivedQuantity) {

    public static InboundOrderItemDto from(InboundOrderItem item) {
        return new InboundOrderItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getSku(),
                item.getProduct().getName(),
                item.getStorageLocation().getId(),
                item.getStorageLocation().getCode(),
                item.getReceivedQuantity());
    }
}
