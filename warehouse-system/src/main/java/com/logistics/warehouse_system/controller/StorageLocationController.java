package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateStorageLocationRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.StorageLocationDto;
import com.logistics.warehouse_system.dto.UpdateStorageLocationRequest;
import com.logistics.warehouse_system.service.StorageLocationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Storage Locations")
@RestController
@RequestMapping("/api/v1/warehouses/{warehouseId}/locations")
public class StorageLocationController {

    private final StorageLocationService storageLocationService;

    public StorageLocationController(StorageLocationService storageLocationService) {
        this.storageLocationService = storageLocationService;
    }

    @GetMapping
    public PageResponse<StorageLocationDto> list(@PathVariable Long warehouseId,
                                                 @RequestParam(required = false) String term,
                                                 @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return storageLocationService.list(warehouseId, term, pageable);
    }

    @GetMapping("/{locationId}")
    public StorageLocationDto get(@PathVariable Long warehouseId, @PathVariable Long locationId) {
        return storageLocationService.get(warehouseId, locationId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public ResponseEntity<StorageLocationDto> create(@PathVariable Long warehouseId,
                                                     @Valid @RequestBody CreateStorageLocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(storageLocationService.create(warehouseId, request));
    }

    @PatchMapping("/{locationId}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public StorageLocationDto update(@PathVariable Long warehouseId,
                                     @PathVariable Long locationId,
                                     @Valid @RequestBody UpdateStorageLocationRequest request) {
        return storageLocationService.update(warehouseId, locationId, request);
    }
}
