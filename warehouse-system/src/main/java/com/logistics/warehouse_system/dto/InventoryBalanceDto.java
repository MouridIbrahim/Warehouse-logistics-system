package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.InventoryBalance;

import java.time.Instant;

public record InventoryBalanceDto(
        Long id,
        Long productId,
        String productSku,
        String productName,
        Long storageLocationId,
        String storageLocationCode,
        Integer quantityOnHand,
        Integer reservedQuantity,
        Integer availableQuantity,
        Integer lowStockThreshold,
        Instant updatedAt) {

    public static InventoryBalanceDto from(InventoryBalance balance) {
        return new InventoryBalanceDto(
                balance.getId(),
                balance.getProduct().getId(),
                balance.getProduct().getSku(),
                balance.getProduct().getName(),
                balance.getStorageLocation().getId(),
                balance.getStorageLocation().getCode(),
                balance.getQuantityOnHand(),
                balance.getReservedQuantity(),
                balance.getAvailableQuantity(),
                balance.getProduct().getLowStockThreshold(),
                balance.getUpdatedAt());
    }
}
