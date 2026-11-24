package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.Shipment;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    boolean existsByTrackingNumber(String trackingNumber);

    Optional<Shipment> findByOutboundOrderId(Long outboundOrderId);

    @EntityGraph(attributePaths = "outboundOrder")
    Page<Shipment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "outboundOrder")
    Page<Shipment> findByStatusOrderByCreatedAtDesc(ShipmentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "outboundOrder")
    @Query("""
            select s from Shipment s
            where (:term is null or lower(s.trackingNumber) like lower(concat('%', :term, '%')))
              and (:status is null or s.status = :status)
              and (:from is null or s.createdAt >= :from)
              and (:to is null or s.createdAt <= :to)
            order by s.createdAt desc, s.id desc
            """)
    Page<Shipment> search(@Param("term") String term,
                          @Param("status") ShipmentStatus status,
                          @Param("from") Instant from,
                          @Param("to") Instant to,
                          Pageable pageable);

    @Query("select s.status, count(s) from Shipment s group by s.status")
    List<Object[]> countGroupedByStatus();

    @Query("select s.status, count(s) from Shipment s where (:warehouseId is null or s.outboundOrder.warehouse.id = :warehouseId) group by s.status")
    List<Object[]> countGroupedByStatus(@Param("warehouseId") Long warehouseId);

    @EntityGraph(attributePaths = "outboundOrder")
    @Query("""
            select s from Shipment s
            where (:warehouseId is null or s.outboundOrder.warehouse.id = :warehouseId)
              and (:from is null or s.createdAt >= :from)
              and (:to is null or s.createdAt <= :to)
            order by s.createdAt desc, s.id desc
            """)
    List<Shipment> findAllForReport(@Param("warehouseId") Long warehouseId,
                                    @Param("from") Instant from,
                                    @Param("to") Instant to);
}
