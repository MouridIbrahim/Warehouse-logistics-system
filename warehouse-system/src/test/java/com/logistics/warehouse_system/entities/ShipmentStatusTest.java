package com.logistics.warehouse_system.entities;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ShipmentStatusTest {

    @Test
    void allowsDocumentedTransitions() {
        assertThat(ShipmentStatus.PENDING.canTransitionTo(ShipmentStatus.PREPARED)).isTrue();
        assertThat(ShipmentStatus.PENDING.canTransitionTo(ShipmentStatus.CANCELLED)).isTrue();
        assertThat(ShipmentStatus.PREPARED.canTransitionTo(ShipmentStatus.IN_TRANSIT)).isTrue();
        assertThat(ShipmentStatus.PREPARED.canTransitionTo(ShipmentStatus.CANCELLED)).isTrue();
        assertThat(ShipmentStatus.IN_TRANSIT.canTransitionTo(ShipmentStatus.DELIVERED)).isTrue();
        assertThat(ShipmentStatus.IN_TRANSIT.canTransitionTo(ShipmentStatus.DELAYED)).isTrue();
        assertThat(ShipmentStatus.DELAYED.canTransitionTo(ShipmentStatus.IN_TRANSIT)).isTrue();
        assertThat(ShipmentStatus.DELAYED.canTransitionTo(ShipmentStatus.DELIVERED)).isTrue();
        assertThat(ShipmentStatus.DELAYED.canTransitionTo(ShipmentStatus.CANCELLED)).isTrue();
    }

    @Test
    void rejectsUndocumentedTransitions() {
        assertThat(ShipmentStatus.PENDING.canTransitionTo(ShipmentStatus.DELIVERED)).isFalse();
        assertThat(ShipmentStatus.PENDING.canTransitionTo(ShipmentStatus.IN_TRANSIT)).isFalse();
        assertThat(ShipmentStatus.IN_TRANSIT.canTransitionTo(ShipmentStatus.PREPARED)).isFalse();
        assertThat(ShipmentStatus.IN_TRANSIT.canTransitionTo(ShipmentStatus.PENDING)).isFalse();
        assertThat(ShipmentStatus.PREPARED.canTransitionTo(ShipmentStatus.DELIVERED)).isFalse();
    }

    @Test
    void deliveredAndCancelledAreTerminal() {
        assertThat(ShipmentStatus.DELIVERED.isTerminal()).isTrue();
        assertThat(ShipmentStatus.CANCELLED.isTerminal()).isTrue();
        assertThat(ShipmentStatus.PENDING.isTerminal()).isFalse();
        assertThat(ShipmentStatus.DELIVERED.allowedTransitions()).isEmpty();
        assertThat(ShipmentStatus.CANCELLED.allowedTransitions()).isEmpty();
    }
}
