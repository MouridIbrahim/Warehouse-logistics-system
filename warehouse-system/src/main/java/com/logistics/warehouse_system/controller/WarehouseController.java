package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateWarehouseRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.UpdateWarehouseRequest;
import com.logistics.warehouse_system.dto.WarehouseDto;
import com.logistics.warehouse_system.service.CsvExportService;
import com.logistics.warehouse_system.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Tag(name = "Warehouses")
@RestController
@RequestMapping("/api/v1/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;
    private final CsvExportService csvExportService;

    public WarehouseController(WarehouseService warehouseService,
                               CsvExportService csvExportService) {
        this.warehouseService = warehouseService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public PageResponse<WarehouseDto> list(@RequestParam(required = false) String term,
                                           @RequestParam(required = false) Boolean active,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                           @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        return warehouseService.list(term, active, fromInstant, toInstant, pageable);
    }

    @GetMapping("/count")
    public long count() {
        return warehouseService.count();
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

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE','VIEWER_AUDITOR')")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String term,
                                         @RequestParam(required = false) Boolean active,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        List<Map<String, Object>> data = warehouseService.exportAll(term, active, fromInstant, toInstant);
        List<String> headers = List.of("ID", "Code", "Name", "Address", "Status", "Created At", "Updated At");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "warehouses.csv");
        return ResponseEntity.ok()
                .headers(responseHeaders)
                .body(csv);
    }
}
