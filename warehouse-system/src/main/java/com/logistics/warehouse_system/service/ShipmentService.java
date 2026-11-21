package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateShipmentRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.ShipmentDto;
import com.logistics.warehouse_system.dto.ShipmentStatusHistoryDto;
import com.logistics.warehouse_system.dto.UpdateShipmentStatusRequest;
import com.logistics.warehouse_system.entities.OutboundOrder;
import com.logistics.warehouse_system.entities.OutboundStatus;
import com.logistics.warehouse_system.entities.Shipment;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import com.logistics.warehouse_system.entities.ShipmentStatusHistory;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.OutboundOrderRepository;
import com.logistics.warehouse_system.repository.ShipmentRepository;
import com.logistics.warehouse_system.repository.ShipmentStatusHistoryRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentStatusHistoryRepository shipmentStatusHistoryRepository;
    private final OutboundOrderRepository outboundOrderRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public ShipmentService(ShipmentRepository shipmentRepository,
                           ShipmentStatusHistoryRepository shipmentStatusHistoryRepository,
                           OutboundOrderRepository outboundOrderRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentStatusHistoryRepository = shipmentStatusHistoryRepository;
        this.outboundOrderRepository = outboundOrderRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ShipmentDto> list(ShipmentStatus status, Pageable pageable) {
        Page<Shipment> page = (status == null)
                ? shipmentRepository.findAllByOrderByCreatedAtDesc(pageable)
                : shipmentRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        List<ShipmentDto> content = page.getContent().stream().map(ShipmentDto::from).toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public ShipmentDto get(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipment", id));
        return ShipmentDto.from(shipment);
    }

    @Transactional
    public ShipmentDto create(CreateShipmentRequest request) {
        if (shipmentRepository.existsByTrackingNumber(request.trackingNumber())) {
            throw new ConflictException("Tracking number already exists: " + request.trackingNumber());
        }
        OutboundOrder outboundOrder = outboundOrderRepository.findById(request.outboundOrderId())
                .orElseThrow(() -> new NotFoundException("Outbound order", request.outboundOrderId()));
        if (outboundOrder.getStatus() != OutboundStatus.DISPATCHED) {
            throw new ConflictException("Outbound order must be DISPATCHED before creating a shipment");
        }
        if (shipmentRepository.findByOutboundOrderId(request.outboundOrderId()).isPresent()) {
            throw new ConflictException("A shipment already exists for this outbound order");
        }

        Shipment shipment = Shipment.builder()
                .trackingNumber(request.trackingNumber())
                .outboundOrder(outboundOrder)
                .carrierName(request.carrierName())
                .status(ShipmentStatus.PENDING)
                .build();
        shipmentRepository.save(shipment);
        auditLogService.record("SHIPMENT_CREATED", "SHIPMENT", shipment.getId());
        return ShipmentDto.from(shipment);
    }

    @Transactional
    public ShipmentDto updateStatus(Long id, UpdateShipmentStatusRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipment", id));

        ShipmentStatus current = shipment.getStatus();
        ShipmentStatus target = request.status();
        if (!current.canTransitionTo(target)) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + target);
        }

        Instant now = Instant.now();
        ShipmentStatusHistory history = ShipmentStatusHistory.builder()
                .shipment(shipment)
                .previousStatus(current)
                .newStatus(target)
                .changedBy(userRepository.getReferenceById(SecurityUtils.currentUserId()))
                .changedAt(now)
                .note(request.note())
                .build();
        shipmentStatusHistoryRepository.save(history);

        shipment.setStatus(target);
        if (target == ShipmentStatus.IN_TRANSIT && shipment.getShippedAt() == null) {
            shipment.setShippedAt(now);
        }
        if (target == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(now);
        }
        shipmentRepository.save(shipment);

        auditLogService.record("SHIPMENT_STATUS_CHANGED", "SHIPMENT", shipment.getId(),
                "from " + current + " to " + target);
        return ShipmentDto.from(shipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentStatusHistoryDto> history(Long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new NotFoundException("Shipment", id);
        }
        return shipmentStatusHistoryRepository.findByShipmentIdOrderByChangedAtAsc(id).stream()
                .map(ShipmentStatusHistoryDto::from)
                .toList();
    }
}
