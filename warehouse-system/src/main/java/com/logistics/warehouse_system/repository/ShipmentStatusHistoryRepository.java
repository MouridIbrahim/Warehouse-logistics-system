package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.ShipmentStatusHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentStatusHistoryRepository extends JpaRepository<ShipmentStatusHistory, Long> {

    @EntityGraph(attributePaths = "changedBy")
    List<ShipmentStatusHistory> findByShipmentIdOrderByChangedAtAsc(Long shipmentId);
}
