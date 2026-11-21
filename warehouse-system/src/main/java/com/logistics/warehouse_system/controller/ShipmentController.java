package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateShipmentRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.ShipmentDto;
import com.logistics.warehouse_system.dto.ShipmentStatusHistoryDto;
import com.logistics.warehouse_system.dto.UpdateShipmentStatusRequest;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import com.logistics.warehouse_system.service.ShipmentService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipments")
public class ShipmentController {

    private static final String VIEW =
            "hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','SHIPMENT_MANAGER','VIEWER_AUDITOR')";
    private static final String MANAGE =
            "hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','SHIPMENT_MANAGER')";

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping
    @PreAuthorize(VIEW)
    public PageResponse<ShipmentDto> list(@RequestParam(required = false) ShipmentStatus status,
                                          @PageableDefault(size = 20) Pageable pageable) {
        return shipmentService.list(status, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize(VIEW)
    public ShipmentDto get(@PathVariable Long id) {
        return shipmentService.get(id);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize(VIEW)
    public List<ShipmentStatusHistoryDto> history(@PathVariable Long id) {
        return shipmentService.history(id);
    }

    @PostMapping
    @PreAuthorize(MANAGE)
    public ResponseEntity<ShipmentDto> create(@Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shipmentService.create(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(MANAGE)
    public ShipmentDto updateStatus(@PathVariable Long id,
                                    @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return shipmentService.updateStatus(id, request);
    }
}
