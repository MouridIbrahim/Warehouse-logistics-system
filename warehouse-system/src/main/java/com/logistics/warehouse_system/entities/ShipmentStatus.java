package com.logistics.warehouse_system.entities;

import java.util.Set;

/**
 * Shipment lifecycle. Transitions are backend-enforced; see
 * docs/PROJECT_DETAILS.md section 9.9.
 */
public enum ShipmentStatus {
    PENDING,
    PREPARED,
    IN_TRANSIT,
    DELIVERED,
    DELAYED,
    CANCELLED;

    public Set<ShipmentStatus> allowedTransitions() {
        return switch (this) {
            case PENDING -> Set.of(PREPARED, CANCELLED);
            case PREPARED -> Set.of(IN_TRANSIT, CANCELLED);
            case IN_TRANSIT -> Set.of(DELIVERED, DELAYED);
            case DELAYED -> Set.of(IN_TRANSIT, DELIVERED, CANCELLED);
            case DELIVERED, CANCELLED -> Set.of();
        };
    }

    public boolean canTransitionTo(ShipmentStatus target) {
        return allowedTransitions().contains(target);
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }
}
