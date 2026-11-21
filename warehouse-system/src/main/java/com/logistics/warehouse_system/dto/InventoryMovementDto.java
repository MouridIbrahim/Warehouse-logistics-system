package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.InventoryMovement;

import java.time.Instant;

public record InventoryMovementDto(
        Long id,
        Long productId,
        String productSku,
        String productName,
        Long storageLocationId,
        String storageLocationCode,
        String movementType,
        Integer quantityDelta,
        String referenceType,
        Long referenceId,
        Long performedById,
        String performedByName,
        Instant occurredAt,
        String notes) {

    public static InventoryMovementDto from(InventoryMovement movement) {
        return new InventoryMovementDto(
                movement.getId(),
                movement.getProduct().getId(),
                movement.getProduct().getSku(),
                movement.getProduct().getName(),
                movement.getStorageLocation().getId(),
                movement.getStorageLocation().getCode(),
                movement.getMovementType().name(),
                movement.getQuantityDelta(),
                movement.getReferenceType().name(),
                movement.getReferenceId(),
                movement.getPerformedBy().getId(),
                movement.getPerformedBy().getDisplayName(),
                movement.getOccurredAt(),
                movement.getNotes());
    }
}
