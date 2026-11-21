package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateOutboundOrderRequest;
import com.logistics.warehouse_system.dto.OutboundOrderDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.entities.OutboundStatus;
import com.logistics.warehouse_system.service.OutboundService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/outbound-orders")
public class OutboundController {

    private final OutboundService outboundService;

    public OutboundController(OutboundService outboundService) {
        this.outboundService = outboundService;
    }

    @GetMapping
    public PageResponse<OutboundOrderDto> list(@RequestParam(required = false) OutboundStatus status,
                                               @PageableDefault(size = 20) Pageable pageable) {
        return outboundService.list(status, pageable);
    }

    @GetMapping("/{id}")
    public OutboundOrderDto get(@PathVariable Long id) {
        return outboundService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public ResponseEntity<OutboundOrderDto> create(@Valid @RequestBody CreateOutboundOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(outboundService.create(request));
    }

    @PostMapping("/{id}/dispatch")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public OutboundOrderDto dispatch(@PathVariable Long id) {
        return outboundService.dispatch(id);
    }
}
