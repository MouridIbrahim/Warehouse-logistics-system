package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.Shipment;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long>,
        JpaSpecificationExecutor<Shipment> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    boolean existsByTrackingNumber(String trackingNumber);

    Optional<Shipment> findByOutboundOrderId(Long outboundOrderId);

    @EntityGraph(attributePaths = "outboundOrder")
    Page<Shipment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "outboundOrder")
    Page<Shipment> findByStatusOrderByCreatedAtDesc(ShipmentStatus status, Pageable pageable);

    @Query("select s.status, count(s) from Shipment s group by s.status")
    List<Object[]> countGroupedByStatus();

    @Query("select s.status, count(s) from Shipment s where (:warehouseId is null or s.outboundOrder.warehouse.id = :warehouseId) group by s.status")
    List<Object[]> countGroupedByStatus(@Param("warehouseId") Long warehouseId);

}
