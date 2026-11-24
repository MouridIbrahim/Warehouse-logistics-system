package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.CreateShipmentRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.ShipmentDto;
import com.logistics.warehouse_system.dto.ShipmentStatusHistoryDto;
import com.logistics.warehouse_system.dto.UpdateShipmentStatusRequest;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import com.logistics.warehouse_system.service.CsvExportService;
import com.logistics.warehouse_system.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Tag(name = "Shipments")
@RestController
@RequestMapping("/api/v1/shipments")
public class ShipmentController {

    private static final String VIEW =
            "hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','SHIPMENT_MANAGER','VIEWER_AUDITOR')";
    private static final String MANAGE =
            "hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','SHIPMENT_MANAGER')";

    private final ShipmentService shipmentService;
    private final CsvExportService csvExportService;

    public ShipmentController(ShipmentService shipmentService,
                              CsvExportService csvExportService) {
        this.shipmentService = shipmentService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    @PreAuthorize(VIEW)
    public PageResponse<ShipmentDto> list(@RequestParam(required = false) String term,
                                          @RequestParam(required = false) ShipmentStatus status,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
                                          @PageableDefault(size = 20) Pageable pageable) {
        return shipmentService.list(term, status, from, to, pageable);
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

    @PostMapping("/{id}/split")
    @PreAuthorize(MANAGE)
    public ResponseEntity<ShipmentDto> split(@PathVariable Long id,
                                             @RequestParam String trackingNumber,
                                             @RequestParam(required = false) String carrierName) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shipmentService.splitShipment(id, trackingNumber, carrierName));
    }

    @PostMapping("/{id}/pod")
    @PreAuthorize(MANAGE)
    public ResponseEntity<ShipmentDto> uploadPod(@PathVariable Long id,
                                                 @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(shipmentService.uploadPod(id, file));
    }

    @GetMapping("/{id}/pod")
    @PreAuthorize(VIEW)
    public ResponseEntity<Resource> downloadPod(@PathVariable Long id) throws Exception {
        Resource resource = shipmentService.downloadPod(id);
        ShipmentDto shipment = shipmentService.get(id);
        String fileName = shipment.podFileName() != null ? shipment.podFileName() : "pod";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @GetMapping("/export")
    @PreAuthorize(VIEW)
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String term,
                                         @RequestParam(required = false) ShipmentStatus status,
                                         @RequestParam(required = false) Long warehouseId,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        List<Map<String, Object>> data = shipmentService.exportAll(term, status, fromInstant, toInstant, warehouseId);
        List<String> headers = List.of("ID", "Tracking Number", "Outbound Order ID", "Outbound Reference", "Carrier", "Status", "Shipped At", "Delivered At", "Created At", "Updated At");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "shipments.csv");
        return ResponseEntity.ok()
                .headers(responseHeaders)
                .body(csv);
    }
}
