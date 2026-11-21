package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.StorageLocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StorageLocationRepository extends JpaRepository<StorageLocation, Long> {

    Optional<StorageLocation> findByWarehouseIdAndCode(Long warehouseId, String code);

    boolean existsByWarehouseIdAndCode(Long warehouseId, String code);

    Optional<StorageLocation> findByWarehouseIdAndId(Long warehouseId, Long id);

    Page<StorageLocation> findByWarehouseId(Long warehouseId, Pageable pageable);

    Page<StorageLocation> findByWarehouseIdAndCodeContainingIgnoreCase(
            Long warehouseId, String code, Pageable pageable);
}
