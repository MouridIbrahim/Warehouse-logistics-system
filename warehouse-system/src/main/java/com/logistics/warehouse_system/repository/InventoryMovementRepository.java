package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long>,
        JpaSpecificationExecutor<InventoryMovement> {

    boolean existsByReferenceIdAndMovementType(Long referenceId, MovementType movementType);

    @Query("""
            select sum(abs(m.quantityDelta)) from InventoryMovement m
            where m.movementType = :type
              and m.occurredAt >= :from
              and m.occurredAt < :to
            """)
    Long sumQuantityByType(@Param("type") MovementType type,
                           @Param("from") Instant from,
                           @Param("to") Instant to);

    @Query("""
            select sum(abs(m.quantityDelta)) from InventoryMovement m
            where m.movementType = :type
              and (:warehouseId is null or m.storageLocation.warehouse.id = :warehouseId)
              and m.occurredAt >= :from
              and m.occurredAt < :to
            """)
    Long sumQuantityByTypeAndWarehouse(@Param("type") MovementType type,
                                       @Param("warehouseId") Long warehouseId,
                                       @Param("from") Instant from,
                                       @Param("to") Instant to);
}
