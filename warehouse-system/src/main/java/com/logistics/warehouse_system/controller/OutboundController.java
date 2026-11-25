package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateOutboundOrderRequest;
import com.logistics.warehouse_system.dto.OutboundOrderDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.entities.OutboundStatus;
import com.logistics.warehouse_system.service.CsvExportService;
import com.logistics.warehouse_system.service.OutboundService;
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

@Tag(name = "Outbound Orders")
@RestController
@RequestMapping("/api/v1/outbound-orders")
public class OutboundController {

    private final OutboundService outboundService;
    private final CsvExportService csvExportService;

    public OutboundController(OutboundService outboundService,
                              CsvExportService csvExportService) {
        this.outboundService = outboundService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public PageResponse<OutboundOrderDto> list(@RequestParam(required = false) String term,
                                               @RequestParam(required = false) OutboundStatus status,
                                               @RequestParam(required = false) Long warehouseId,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                               @PageableDefault(size = 20) Pageable pageable) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        return outboundService.list(term, status, warehouseId, fromInstant, toInstant, pageable);
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

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE')")
    public OutboundOrderDto cancel(@PathVariable Long id) {
        return outboundService.cancel(id);
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','WAREHOUSE_EMPLOYEE','VIEWER_AUDITOR')")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String term,
                                         @RequestParam(required = false) OutboundStatus status,
                                         @RequestParam(required = false) Long warehouseId,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        List<Map<String, Object>> data = outboundService.exportAll(term, status, warehouseId, fromInstant, toInstant);
        List<String> headers = List.of("ID", "Reference Number", "Warehouse ID", "Status", "Requested At", "Created By", "Notes", "Created At", "Updated At");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "outbound-orders.csv");
        return ResponseEntity.ok()
                .headers(responseHeaders)
                .body(csv);
    }
}
