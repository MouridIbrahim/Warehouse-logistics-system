package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    @EntityGraph(attributePaths = {"product", "storageLocation", "performedBy"})
    @Query("""
            select m from InventoryMovement m
            where (:productId is null or m.product.id = :productId)
              and (:locationId is null or m.storageLocation.id = :locationId)
            order by m.occurredAt desc, m.id desc
            """)
    Page<InventoryMovement> search(@Param("productId") Long productId,
                                   @Param("locationId") Long locationId,
                                   Pageable pageable);

    @Query("""
            select sum(abs(m.quantityDelta)) from InventoryMovement m
            where m.movementType = :type
              and (:from is null or m.occurredAt >= :from)
              and (:to is null or m.occurredAt < :to)
            """)
    Long sumQuantityByType(@Param("type") MovementType type,
                           @Param("from") Instant from,
                           @Param("to") Instant to);
}
