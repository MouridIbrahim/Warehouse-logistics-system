package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateInboundOrderRequest;
import com.logistics.warehouse_system.dto.InboundOrderDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.entities.InboundStatus;
import com.logistics.warehouse_system.service.InboundService;
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
@RequestMapping("/api/v1/inbound-orders")
public class InboundController {

    private final InboundService inboundService;

    public InboundController(InboundService inboundService) {
        this.inboundService = inboundService;
    }

    @GetMapping
    public PageResponse<InboundOrderDto> list(@RequestParam(required = false) InboundStatus status,
                                              @PageableDefault(size = 20) Pageable pageable) {
        return inboundService.list(status, pageable);
    }

    @GetMapping("/{id}")
    public InboundOrderDto get(@PathVariable Long id) {
        return inboundService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public ResponseEntity<InboundOrderDto> create(@Valid @RequestBody CreateInboundOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inboundService.create(request));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public InboundOrderDto confirm(@PathVariable Long id) {
        return inboundService.confirm(id);
    }
}
