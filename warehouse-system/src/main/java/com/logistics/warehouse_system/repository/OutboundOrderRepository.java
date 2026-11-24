package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.OutboundOrder;
import com.logistics.warehouse_system.entities.OutboundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long> {

    Optional<OutboundOrder> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    @Query("""
            select distinct o from OutboundOrder o
            left join fetch o.items i
            left join fetch i.product
            left join fetch i.storageLocation
            left join fetch o.warehouse
            left join fetch o.createdBy
            where o.id = :id
            """)
    Optional<OutboundOrder> findByIdWithItems(@Param("id") Long id);

    @EntityGraph(attributePaths = {"createdBy", "warehouse"})
    Page<OutboundOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"createdBy", "warehouse"})
    Page<OutboundOrder> findByStatusOrderByCreatedAtDesc(OutboundStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"createdBy", "warehouse"})
    @Query("""
            select distinct o from OutboundOrder o
            where (:term is null or lower(o.referenceNumber) like lower(concat('%', :term, '%')))
              and (:status is null or o.status = :status)
              and (:warehouseId is null or o.warehouse.id = :warehouseId)
              and (:from is null or o.createdAt >= :from)
              and (:to is null or o.createdAt <= :to)
            order by o.createdAt desc, o.id desc
            """)
    Page<OutboundOrder> search(@Param("term") String term,
                               @Param("status") OutboundStatus status,
                               @Param("warehouseId") Long warehouseId,
                               @Param("from") Instant from,
                               @Param("to") Instant to,
                               Pageable pageable);

    @EntityGraph(attributePaths = {"createdBy", "warehouse"})
    @Query("""
            select distinct o from OutboundOrder o
            where (:warehouseId is null or o.warehouse.id = :warehouseId)
              and (:from is null or o.createdAt >= :from)
              and (:to is null or o.createdAt <= :to)
            order by o.createdAt desc, o.id desc
            """)
    List<OutboundOrder> findAllForReport(@Param("warehouseId") Long warehouseId,
                                         @Param("from") Instant from,
                                         @Param("to") Instant to);

    long countByStatus(OutboundStatus status);

    @Query("select count(o) from OutboundOrder o where o.status = :status and (:warehouseId is null or o.warehouse.id = :warehouseId)")
    long countByStatusAndWarehouse(OutboundStatus status, @Param("warehouseId") Long warehouseId);
}
