package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.OutboundOrder;
import com.logistics.warehouse_system.entities.OutboundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long>,
        JpaSpecificationExecutor<OutboundOrder> {

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

    @Query("""
            select new com.logistics.warehouse_system.repository.OrderItemCount(o.id, count(i.id))
            from OutboundOrder o left join o.items i
            where o.id in :orderIds
            group by o.id
            """)
    List<OrderItemCount> countItemsByOrderIds(@Param("orderIds") List<Long> orderIds);

    @EntityGraph(attributePaths = {"createdBy", "warehouse"})
    Page<OutboundOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"createdBy", "warehouse"})
    Page<OutboundOrder> findByStatusOrderByCreatedAtDesc(OutboundStatus status, Pageable pageable);

    long countByStatus(OutboundStatus status);

    @Query("select count(o) from OutboundOrder o where o.status = :status and (:warehouseId is null or o.warehouse.id = :warehouseId)")
    long countByStatusAndWarehouse(OutboundStatus status, @Param("warehouseId") Long warehouseId);
}
