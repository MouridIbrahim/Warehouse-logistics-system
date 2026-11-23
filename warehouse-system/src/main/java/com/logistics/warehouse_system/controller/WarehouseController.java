package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateWarehouseRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.UpdateWarehouseRequest;
import com.logistics.warehouse_system.dto.WarehouseDto;
import com.logistics.warehouse_system.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.Instant;

@Tag(name = "Warehouses")
@RestController
@RequestMapping("/api/v1/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    public PageResponse<WarehouseDto> list(@RequestParam(required = false) String term,
                                           @RequestParam(required = false) Boolean active,
                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
                                           @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return warehouseService.list(term, active, from, to, pageable);
    }

    @GetMapping("/{id}")
    public WarehouseDto get(@PathVariable Long id) {
        return warehouseService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public ResponseEntity<WarehouseDto> create(@Valid @RequestBody CreateWarehouseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseService.create(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public WarehouseDto update(@PathVariable Long id, @Valid @RequestBody UpdateWarehouseRequest request) {
        return warehouseService.update(id, request);
    }
}
