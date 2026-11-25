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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Map;

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
    public PageResponse<ShipmentDto> list(String term, ShipmentStatus status, Instant from, Instant to, Pageable pageable) {
        Page<Shipment> page = shipmentRepository.findAll(
                searchSpec(term, status, null, from, to), pageable);
        List<ShipmentDto> content = page.getContent().stream().map(ShipmentDto::from).toList();
        return PageResponse.of(page, content);
    }

    private Specification<Shipment> searchSpec(String term, ShipmentStatus status, Long warehouseId,
                                               Instant from, Instant to) {
        return Specification.allOf(
                term == null || term.isBlank()
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.like(
                                cb.lower(root.get("trackingNumber")),
                                "%" + term.trim().toLowerCase(java.util.Locale.ROOT) + "%"),
                status == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(root.get("status"), status),
                warehouseId == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(
                                root.get("outboundOrder").get("warehouse").get("id"), warehouseId),
                from == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from),
                to == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> exportAll(String term, ShipmentStatus status, Instant from, Instant to,
                                               Long warehouseId) {
        List<Shipment> shipments = shipmentRepository.findAll(
                searchSpec(term, status, warehouseId, from, to),
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return shipments.stream().map(s -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", s.getId());
            map.put("trackingNumber", s.getTrackingNumber());
            map.put("outboundOrderId", s.getOutboundOrder() != null ? s.getOutboundOrder().getId() : null);
            map.put("outboundReferenceNumber", s.getOutboundOrder() != null ? s.getOutboundOrder().getReferenceNumber() : "");
            map.put("carrierName", s.getCarrierName() != null ? s.getCarrierName() : "");
            map.put("status", s.getStatus());
            map.put("shippedAt", s.getShippedAt() != null ? s.getShippedAt().toString() : "");
            map.put("deliveredAt", s.getDeliveredAt() != null ? s.getDeliveredAt().toString() : "");
            map.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : "");
            map.put("updatedAt", s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : "");
            return map;
        }).toList();
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

    @Transactional
    public ShipmentDto splitShipment(Long id, String trackingNumber, String carrierName) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipment", id));

        if (shipment.getStatus() != ShipmentStatus.PENDING && shipment.getStatus() != ShipmentStatus.IN_TRANSIT) {
            throw new BadRequestException("Cannot split shipment with status " + shipment.getStatus());
        }

        if (shipmentRepository.existsByTrackingNumber(trackingNumber)) {
            throw new ConflictException("Tracking number already exists: " + trackingNumber);
        }

        OutboundOrder outboundOrder = shipment.getOutboundOrder();
        if (outboundOrder.getStatus() != OutboundStatus.DISPATCHED) {
            throw new ConflictException("Outbound order must be DISPATCHED to split shipment");
        }

        Shipment newShipment = Shipment.builder()
                .trackingNumber(trackingNumber)
                .outboundOrder(outboundOrder)
                .carrierName(carrierName != null ? carrierName : shipment.getCarrierName())
                .status(ShipmentStatus.PENDING)
                .build();
        shipmentRepository.save(newShipment);

        auditLogService.record("SHIPMENT_SPLIT", "SHIPMENT", newShipment.getId(),
                "split from shipment #" + id + " with tracking " + trackingNumber);
        return ShipmentDto.from(newShipment);
    }

    private static final Path POD_STORAGE = Paths.get("uploads/pods");

    @Transactional
    public ShipmentDto uploadPod(Long id, MultipartFile file) throws IOException {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipment", id));

        if (shipment.getStatus() != ShipmentStatus.IN_TRANSIT && shipment.getStatus() != ShipmentStatus.DELIVERED) {
            throw new BadRequestException("POD can only be uploaded for IN_TRANSIT or DELIVERED shipments");
        }

        Files.createDirectories(POD_STORAGE);
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String storedFileName = System.currentTimeMillis() + "_" + originalFileName;
        Path targetPath = POD_STORAGE.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetPath);

        Instant now = Instant.now();
        shipment.setPodFileName(storedFileName);
        shipment.setPodUploadedAt(now);
        shipmentRepository.save(shipment);

        auditLogService.record("SHIPMENT_POD_UPLOADED", "SHIPMENT", shipment.getId(),
                "POD file: " + storedFileName);
        return ShipmentDto.from(shipment);
    }

    @Transactional(readOnly = true)
    public Resource downloadPod(Long id) throws MalformedURLException {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipment", id));

        if (shipment.getPodFileName() == null) {
            throw new NotFoundException("POD file", id);
        }

        Path filePath = POD_STORAGE.resolve(shipment.getPodFileName()).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new NotFoundException("POD file not found on disk", id);
        }
        return resource;
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
