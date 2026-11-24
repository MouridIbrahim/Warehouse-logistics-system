package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.DashboardDto;
import com.logistics.warehouse_system.service.CsvExportService;
import com.logistics.warehouse_system.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "Reports")
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;
    private final CsvExportService csvExportService;

    public ReportController(ReportService reportService,
                            CsvExportService csvExportService) {
        this.reportService = reportService;
        this.csvExportService = csvExportService;
    }

    @GetMapping("/dashboard")
    public DashboardDto dashboard(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.dashboard(warehouseId, from, to);
    }

    @GetMapping("/inventory-movements")
    public ResponseEntity<byte[]> inventoryMovements(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Map<String, Object>> data = reportService.inventoryMovements(warehouseId, from, to);
        List<String> headers = List.of("Date", "Product SKU", "Product Name", "Location", "Type", "Quantity Delta", "Reference", "Performed By");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "inventory-movements.csv");
        return ResponseEntity.ok().headers(responseHeaders).body(csv);
    }

    @GetMapping("/inbound-summary")
    public ResponseEntity<byte[]> inboundSummary(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Map<String, Object>> data = reportService.inboundSummary(warehouseId, from, to);
        List<String> headers = List.of("Reference Number", "Warehouse", "Status", "Created At", "Confirmed At", "Items", "Total Quantity");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "inbound-summary.csv");
        return ResponseEntity.ok().headers(responseHeaders).body(csv);
    }

    @GetMapping("/outbound-summary")
    public ResponseEntity<byte[]> outboundSummary(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Map<String, Object>> data = reportService.outboundSummary(warehouseId, from, to);
        List<String> headers = List.of("Reference Number", "Warehouse", "Status", "Created At", "Dispatched At", "Items", "Total Quantity");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "outbound-summary.csv");
        return ResponseEntity.ok().headers(responseHeaders).body(csv);
    }

    @GetMapping("/shipment-summary")
    public ResponseEntity<byte[]> shipmentSummary(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Map<String, Object>> data = reportService.shipmentSummary(warehouseId, from, to);
        List<String> headers = List.of("Tracking Number", "Outbound Reference", "Carrier", "Status", "Shipped At", "Delivered At", "POD Uploaded At", "Created At");
        byte[] csv = csvExportService.exportToCsvFromMaps(headers, data);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        responseHeaders.setContentDispositionFormData("attachment", "shipment-summary.csv");
        return ResponseEntity.ok().headers(responseHeaders).body(csv);
    }
}
