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
            """)
    Page<InventoryBalance> search(@Param("productId") Long productId,
                                  @Param("locationId") Long locationId,
                                  Pageable pageable);

    @Query("select sum(b.quantityOnHand) from InventoryBalance b")
    Long totalQuantityOnHand();
}
