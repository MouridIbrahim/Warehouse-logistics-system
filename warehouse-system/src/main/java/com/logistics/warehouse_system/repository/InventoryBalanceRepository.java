package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.InventoryBalance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, Long> {

    Optional<InventoryBalance> findByProductIdAndStorageLocationId(Long productId, Long storageLocationId);

    @EntityGraph(attributePaths = {"product", "storageLocation"})
    @Query("""
            select b from InventoryBalance b
            where (:productId is null or b.product.id = :productId)
              and (:locationId is null or b.storageLocation.id = :locationId)
              and (:quantityCondition is null or
                (:quantityCondition = 'LOW_STOCK' and b.quantityOnHand < b.product.lowStockThreshold) or
                (:quantityCondition = 'OUT_OF_STOCK' and b.quantityOnHand = 0) or
                (:quantityCondition = 'IN_STOCK' and b.quantityOnHand > 0))
            """)
    Page<InventoryBalance> search(@Param("productId") Long productId,
                                  @Param("locationId") Long locationId,
                                  @Param("quantityCondition") String quantityCondition,
                                  Pageable pageable);

    @Query("select sum(b.quantityOnHand) from InventoryBalance b")
    Long totalQuantityOnHand();

    @Query("select sum(b.quantityOnHand) from InventoryBalance b where (:warehouseId is null or b.storageLocation.warehouse.id = :warehouseId)")
    Long totalQuantityOnHandByWarehouse(@Param("warehouseId") Long warehouseId);
}
