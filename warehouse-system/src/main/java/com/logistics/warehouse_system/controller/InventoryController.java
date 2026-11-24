package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateAdjustmentRequest;
import com.logistics.warehouse_system.dto.InventoryBalanceDto;
import com.logistics.warehouse_system.dto.InventoryMovementDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.service.CsvExportService;
import com.logistics.warehouse_system.service.InventoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Tag(name = "Inventory")
@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final CsvExportService csvExportService;

    public InventoryController(InventoryService inventoryService,
                               CsvExportService csvExportService) {
        this.inventoryService = inventoryService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public PageResponse<InventoryBalanceDto> balances(@RequestParam(required = false) Long productId,
                                                      @RequestParam(required = false) Long locationId,
                                                      @RequestParam(required = false) String quantityCondition,
                                                      @PageableDefault(size = 20) Pageable pageable) {
        return inventoryService.listBalances(productId, locationId, quantityCondition, pageable);
    }

    @GetMapping("/movements")
    public PageResponse<InventoryMovementDto> movements(@RequestParam(required = false) Long productId,
                                                        @RequestParam(required = false) Long locationId,
                                                        @PageableDefault(size = 20) Pageable pageable) {
        return inventoryService.listMovements(productId, locationId, pageable);
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public InventoryBalanceDto adjust(@Valid @RequestBody CreateAdjustmentRequest request) {
        return inventoryService.adjust(request);
    }

    @PostMapping("/reserve")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public InventoryBalanceDto reserve(@RequestParam Long productId,
                                       @RequestParam Long locationId,
                                       @RequestParam Integer quantity) {
        return inventoryService.reserveStock(productId, locationId, quantity);
    }

    @PostMapping("/release")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public InventoryBalanceDto release(@RequestParam Long productId,
                                       @RequestParam Long locationId,
                                       @RequestParam Integer quantity) {
        return inventoryService.releaseStock(productId, locationId, quantity);
    }

    @PostMapping("/cycle-count")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public InventoryBalanceDto cycleCount(@RequestParam Long productId,
                                          @RequestParam Long locationId,
                                          @RequestParam @NotNull @Min(0) Integer countedQuantity,
                                          @RequestParam(required = false) String notes) {
        return inventoryService.cycleCount(productId, locationId, countedQuantity, notes);
    }

    @PostMapping("/movements/{movementId}/reverse")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER')")
    public InventoryBalanceDto reverseAdjustment(@PathVariable Long movementId) {
        return inventoryService.reverseAdjustment(movementId);
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE','VIEWER_AUDITOR')")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) Long productId,
                                         @RequestParam(required = false) Long locationId,
                                         @RequestParam(required = false) String quantityCondition) {
        List<Map<String, Object>> data = inventoryService.exportBalances(productId, locationId, quantityCondition);
        List<String> headers = List.of("ID", "Product ID", "Product SKU", "Product Name", "Location ID", "Location Code", "Quantity On Hand", "Reserved", "Available", "Updated At");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "inventory.csv");
        return ResponseEntity.ok()
                .headers(responseHeaders)
                .body(csv);
    }
}