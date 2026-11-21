package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateAdjustmentRequest;
import com.logistics.warehouse_system.dto.InventoryBalanceDto;
import com.logistics.warehouse_system.dto.InventoryMovementDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public PageResponse<InventoryBalanceDto> balances(@RequestParam(required = false) Long productId,
                                                      @RequestParam(required = false) Long locationId,
                                                      @PageableDefault(size = 20) Pageable pageable) {
        return inventoryService.listBalances(productId, locationId, pageable);
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
}
