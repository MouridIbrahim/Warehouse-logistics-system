package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.DashboardDto;
import com.logistics.warehouse_system.dto.ShipmentStatusCount;
import com.logistics.warehouse_system.entities.InboundStatus;
import com.logistics.warehouse_system.entities.MovementType;
import com.logistics.warehouse_system.entities.OutboundStatus;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import com.logistics.warehouse_system.repository.InboundOrderRepository;
import com.logistics.warehouse_system.repository.InventoryBalanceRepository;
import com.logistics.warehouse_system.repository.InventoryMovementRepository;
import com.logistics.warehouse_system.repository.OutboundOrderRepository;
import com.logistics.warehouse_system.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;

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
    public DashboardDto dashboard(LocalDate from, LocalDate to) {
        Instant fromInstant = from == null ? null : from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to == null ? null : to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        Long inbound = inventoryMovementRepository.sumQuantityByType(MovementType.INBOUND, fromInstant, toInstant);
        Long outbound = inventoryMovementRepository.sumQuantityByType(MovementType.OUTBOUND, fromInstant, toInstant);
        Long totalOnHand = inventoryBalanceRepository.totalQuantityOnHand();

        long pendingInbound = inboundOrderRepository.countByStatus(InboundStatus.DRAFT);
        long pendingOutbound = outboundOrderRepository.countByStatus(OutboundStatus.DRAFT);

        List<ShipmentStatusCount> shipmentCounts = shipmentRepository.countGroupedByStatus().stream()
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
}
