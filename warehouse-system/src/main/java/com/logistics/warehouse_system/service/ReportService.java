package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.DashboardDto;
import com.logistics.warehouse_system.dto.ShipmentStatusCount;
import com.logistics.warehouse_system.entities.InboundStatus;
import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.InboundOrder;
import com.logistics.warehouse_system.entities.MovementType;
import com.logistics.warehouse_system.entities.OutboundOrder;
import com.logistics.warehouse_system.entities.OutboundStatus;
import com.logistics.warehouse_system.entities.Shipment;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import com.logistics.warehouse_system.repository.InboundOrderRepository;
import com.logistics.warehouse_system.repository.InventoryBalanceRepository;
import com.logistics.warehouse_system.repository.InventoryMovementRepository;
import com.logistics.warehouse_system.repository.OutboundOrderRepository;
import com.logistics.warehouse_system.repository.ShipmentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final InboundOrderRepository inboundOrderRepository;
    private final OutboundOrderRepository outboundOrderRepository;
    private final ShipmentRepository shipmentRepository;

    public ReportService(InventoryMovementRepository inventoryMovementRepository,
                         InventoryBalanceRepository inventoryBalanceRepository,
                         InboundOrderRepository inboundOrderRepository,
                         OutboundOrderRepository outboundOrderRepository,
                         ShipmentRepository shipmentRepository) {
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.inventoryBalanceRepository = inventoryBalanceRepository;
        this.inboundOrderRepository = inboundOrderRepository;
        this.outboundOrderRepository = outboundOrderRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDto dashboard(Long warehouseId, LocalDate from, LocalDate to) {
        // Sentinel values keep the query parameters non-null so PostgreSQL can infer their type.
        Instant fromInstant = from == null
                ? Instant.parse("1900-01-01T00:00:00Z")
                : from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to == null
                ? Instant.parse("2999-01-01T00:00:00Z")
                : to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        Long inbound = inventoryMovementRepository.sumQuantityByTypeAndWarehouse(MovementType.INBOUND, warehouseId, fromInstant, toInstant);
        Long outbound = inventoryMovementRepository.sumQuantityByTypeAndWarehouse(MovementType.OUTBOUND, warehouseId, fromInstant, toInstant);
        Long totalOnHand = inventoryBalanceRepository.totalQuantityOnHandByWarehouse(warehouseId);

        long pendingInbound = inboundOrderRepository.countByStatusAndWarehouse(InboundStatus.DRAFT, warehouseId);
        long pendingOutbound = outboundOrderRepository.countByStatusAndWarehouse(OutboundStatus.DRAFT, warehouseId);

        List<ShipmentStatusCount> shipmentCounts = shipmentRepository.countGroupedByStatus(warehouseId).stream()
                .map(row -> new ShipmentStatusCount(
                        ((ShipmentStatus) row[0]).name(),
                        ((Number) row[1]).longValue()))
                .sorted(Comparator.comparing(ShipmentStatusCount::status))
                .toList();

        return new DashboardDto(
                inbound == null ? 0 : inbound,
                outbound == null ? 0 : outbound,
                totalOnHand == null ? 0 : totalOnHand,
                pendingInbound,
                pendingOutbound,
                shipmentCounts);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> inventoryMovements(Long warehouseId, LocalDate from, LocalDate to) {
        Instant fromInstant = from == null ? null : from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to == null ? null : to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Specification<InventoryMovement> spec = Specification.allOf(
                warehouseId == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(
                                root.get("storageLocation").get("warehouse").get("id"), warehouseId),
                fromInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("occurredAt"), fromInstant),
                toInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("occurredAt"), toInstant));
        List<InventoryMovement> movements = inventoryMovementRepository.findAll(
                spec, Sort.by(Sort.Direction.DESC, "occurredAt", "id"));
        return movements.stream().map(m -> {
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("Date", m.getOccurredAt() != null ? m.getOccurredAt().toString() : "");
            row.put("Product SKU", m.getProduct() != null ? m.getProduct().getSku() : "");
            row.put("Product Name", m.getProduct() != null ? m.getProduct().getName() : "");
            row.put("Location", m.getStorageLocation() != null ? m.getStorageLocation().getCode() : "");
            row.put("Type", m.getMovementType() != null ? m.getMovementType().name() : "");
            row.put("Quantity Delta", m.getQuantityDelta());
            row.put("Reference", m.getReferenceType() != null ? m.getReferenceType() + "#" + m.getReferenceId() : "");
            row.put("Performed By", m.getPerformedBy() != null ? m.getPerformedBy().getDisplayName() : "");
            return row;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> inboundSummary(Long warehouseId, LocalDate from, LocalDate to) {
        Instant fromInstant = from == null ? null : from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to == null ? null : to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Specification<InboundOrder> spec = Specification.allOf(
                warehouseId == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(root.get("warehouse").get("id"), warehouseId),
                fromInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), fromInstant),
                toInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), toInstant));
        List<InboundOrder> orders = inboundOrderRepository.findAll(
                spec, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return orders.stream().map(o -> {
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("Reference Number", o.getReferenceNumber());
            row.put("Warehouse", o.getWarehouse() != null ? o.getWarehouse().getCode() : "");
            row.put("Status", o.getStatus() != null ? o.getStatus().name() : "");
            row.put("Created At", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");
            row.put("Confirmed At", o.getReceivedAt() != null ? o.getReceivedAt().toString() : "");
            row.put("Items", o.getItems() != null ? o.getItems().size() : 0);
            row.put("Total Quantity", o.getItems() != null
                    ? o.getItems().stream().mapToLong(i -> i.getReceivedQuantity()).sum()
                    : 0);
            return row;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> outboundSummary(Long warehouseId, LocalDate from, LocalDate to) {
        Instant fromInstant = from == null ? null : from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to == null ? null : to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Specification<OutboundOrder> spec = Specification.allOf(
                warehouseId == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(root.get("warehouse").get("id"), warehouseId),
                fromInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), fromInstant),
                toInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), toInstant));
        List<OutboundOrder> orders = outboundOrderRepository.findAll(
                spec, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return orders.stream().map(o -> {
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("Reference Number", o.getReferenceNumber());
            row.put("Warehouse", o.getWarehouse() != null ? o.getWarehouse().getCode() : "");
            row.put("Status", o.getStatus() != null ? o.getStatus().name() : "");
            row.put("Created At", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");
            row.put("Dispatched At", o.getRequestedAt() != null ? o.getRequestedAt().toString() : "");
            row.put("Items", o.getItems() != null ? o.getItems().size() : 0);
            row.put("Total Quantity", o.getItems() != null
                    ? o.getItems().stream().mapToLong(i -> i.getRequestedQuantity()).sum()
                    : 0);
            return row;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> shipmentSummary(Long warehouseId, LocalDate from, LocalDate to) {
        Instant fromInstant = from == null ? null : from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to == null ? null : to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Specification<Shipment> spec = Specification.allOf(
                warehouseId == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(
                                root.get("outboundOrder").get("warehouse").get("id"), warehouseId),
                fromInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), fromInstant),
                toInstant == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), toInstant));
        List<Shipment> shipments = shipmentRepository.findAll(
                spec, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return shipments.stream().map(s -> {
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("Tracking Number", s.getTrackingNumber());
            row.put("Outbound Reference", s.getOutboundOrder() != null ? s.getOutboundOrder().getReferenceNumber() : "");
            row.put("Carrier", s.getCarrierName() != null ? s.getCarrierName() : "");
            row.put("Status", s.getStatus() != null ? s.getStatus().name() : "");
            row.put("Shipped At", s.getShippedAt() != null ? s.getShippedAt().toString() : "");
            row.put("Delivered At", s.getDeliveredAt() != null ? s.getDeliveredAt().toString() : "");
            row.put("POD Uploaded At", s.getPodUploadedAt() != null ? s.getPodUploadedAt().toString() : "");
            row.put("Created At", s.getCreatedAt() != null ? s.getCreatedAt().toString() : "");
            return row;
        }).collect(Collectors.toList());
    }
}
