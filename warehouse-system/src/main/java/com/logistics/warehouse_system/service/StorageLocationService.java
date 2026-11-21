package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateStorageLocationRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.StorageLocationDto;
import com.logistics.warehouse_system.dto.UpdateStorageLocationRequest;
import com.logistics.warehouse_system.entities.StorageLocation;
import com.logistics.warehouse_system.entities.Warehouse;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.StorageLocationRepository;
import com.logistics.warehouse_system.repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StorageLocationService {

    private final WarehouseRepository warehouseRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final AuditLogService auditLogService;

    public StorageLocationService(WarehouseRepository warehouseRepository,
                                  StorageLocationRepository storageLocationRepository,
                                  AuditLogService auditLogService) {
        this.warehouseRepository = warehouseRepository;
        this.storageLocationRepository = storageLocationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<StorageLocationDto> list(Long warehouseId, String term, Pageable pageable) {
        requireWarehouse(warehouseId);
        Page<StorageLocation> page = (term == null || term.isBlank())
                ? storageLocationRepository.findByWarehouseId(warehouseId, pageable)
                : storageLocationRepository.findByWarehouseIdAndCodeContainingIgnoreCase(
                        warehouseId, term.trim(), pageable);
        List<StorageLocationDto> content = page.getContent().stream()
                .map(location -> StorageLocationDto.from(location, warehouseId))
                .toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public StorageLocationDto get(Long warehouseId, Long locationId) {
        StorageLocation location = storageLocationRepository.findByWarehouseIdAndId(warehouseId, locationId)
                .orElseThrow(() -> new NotFoundException("Storage location", locationId));
        return StorageLocationDto.from(location, warehouseId);
    }

    @Transactional
    public StorageLocationDto create(Long warehouseId, CreateStorageLocationRequest request) {
        Warehouse warehouse = requireWarehouse(warehouseId);
        if (storageLocationRepository.existsByWarehouseIdAndCode(warehouseId, request.code())) {
            throw new ConflictException("Location code already exists in this warehouse: " + request.code());
        }
        StorageLocation location = StorageLocation.builder()
                .warehouse(warehouse)
                .code(request.code())
                .name(request.name())
                .active(true)
                .build();
        storageLocationRepository.save(location);
        auditLogService.record("LOCATION_CREATED", "STORAGE_LOCATION", location.getId());
        return StorageLocationDto.from(location, warehouseId);
    }

    @Transactional
    public StorageLocationDto update(Long warehouseId, Long locationId, UpdateStorageLocationRequest request) {
        StorageLocation location = storageLocationRepository.findByWarehouseIdAndId(warehouseId, locationId)
                .orElseThrow(() -> new NotFoundException("Storage location", locationId));

        if (request.code() != null && !request.code().equals(location.getCode())) {
            if (storageLocationRepository.existsByWarehouseIdAndCode(warehouseId, request.code())) {
                throw new ConflictException("Location code already exists in this warehouse: " + request.code());
            }
            location.setCode(request.code());
        }
        if (request.name() != null) {
            location.setName(request.name());
        }
        if (request.active() != null) {
            location.setActive(request.active());
        }

        storageLocationRepository.save(location);
        auditLogService.record("LOCATION_UPDATED", "STORAGE_LOCATION", location.getId());
        return StorageLocationDto.from(location, warehouseId);
    }

    private Warehouse requireWarehouse(Long warehouseId) {
        return warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse", warehouseId));
    }
}
