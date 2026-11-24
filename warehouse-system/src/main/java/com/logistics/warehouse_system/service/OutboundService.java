package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateOutboundOrderItemRequest;
import com.logistics.warehouse_system.dto.CreateOutboundOrderRequest;
import com.logistics.warehouse_system.dto.OutboundOrderDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.entities.InventoryBalance;
import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.MovementReferenceType;
import com.logistics.warehouse_system.entities.MovementType;
import com.logistics.warehouse_system.entities.OutboundOrder;
import com.logistics.warehouse_system.entities.OutboundOrderItem;
import com.logistics.warehouse_system.entities.OutboundStatus;
import com.logistics.warehouse_system.entities.Product;
import com.logistics.warehouse_system.entities.StorageLocation;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.entities.Warehouse;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.InventoryBalanceRepository;
import com.logistics.warehouse_system.repository.InventoryMovementRepository;
import com.logistics.warehouse_system.repository.OutboundOrderRepository;
import com.logistics.warehouse_system.repository.ProductRepository;
import com.logistics.warehouse_system.repository.StorageLocationRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.repository.WarehouseRepository;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class OutboundService {

    private final OutboundOrderRepository outboundOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final UserRepository userRepository;
    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final InventoryService inventoryService;
    private final AuditLogService auditLogService;

    public OutboundService(OutboundOrderRepository outboundOrderRepository,
                           WarehouseRepository warehouseRepository,
                           ProductRepository productRepository,
                           StorageLocationRepository storageLocationRepository,
                           UserRepository userRepository,
                           InventoryBalanceRepository inventoryBalanceRepository,
                           InventoryMovementRepository inventoryMovementRepository,
                           InventoryService inventoryService,
                           AuditLogService auditLogService) {
        this.outboundOrderRepository = outboundOrderRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.storageLocationRepository = storageLocationRepository;
        this.userRepository = userRepository;
        this.inventoryBalanceRepository = inventoryBalanceRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<OutboundOrderDto> list(String term, OutboundStatus status, Long warehouseId,
                                               Instant from, Instant to, Pageable pageable) {
        Page<OutboundOrder> page = outboundOrderRepository.search(term, status, warehouseId, from, to, pageable);
        List<OutboundOrderDto> content = page.getContent().stream().map(OutboundOrderDto::summary).toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> exportAll(String term, OutboundStatus status, Long warehouseId,
                                               Instant from, Instant to) {
        List<OutboundOrder> orders = outboundOrderRepository.search(term, status, warehouseId, from, to,
                org.springframework.data.domain.Pageable.unpaged())
                .getContent();
        return orders.stream().map(o -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", o.getId());
            map.put("referenceNumber", o.getReferenceNumber());
            map.put("warehouseId", o.getWarehouse().getId());
            map.put("status", o.getStatus());
            map.put("requestedAt", o.getRequestedAt() != null ? o.getRequestedAt().toString() : "");
            map.put("createdById", o.getCreatedBy() != null ? o.getCreatedBy().getId() : null);
            map.put("createdByName", o.getCreatedBy() != null ? o.getCreatedBy().getDisplayName() : "");
            map.put("notes", o.getNotes() != null ? o.getNotes() : "");
            map.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");
            map.put("updatedAt", o.getUpdatedAt() != null ? o.getUpdatedAt().toString() : "");
            return map;
        }).toList();
    }

    @Transactional(readOnly = true)
    public OutboundOrderDto get(Long id) {
        OutboundOrder order = outboundOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Outbound order", id));
        return OutboundOrderDto.detail(order);
    }

    @Transactional
    public OutboundOrderDto create(CreateOutboundOrderRequest request) {
        if (outboundOrderRepository.existsByReferenceNumber(request.referenceNumber())) {
            throw new ConflictException("Reference number already exists: " + request.referenceNumber());
        }
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse", request.warehouseId()));
        User creator = userRepository.getReferenceById(SecurityUtils.currentUserId());

        OutboundOrder order = OutboundOrder.builder()
                .referenceNumber(request.referenceNumber())
                .warehouse(warehouse)
                .status(OutboundStatus.DRAFT)
                .createdBy(creator)
                .notes(request.notes())
                .build();

        for (CreateOutboundOrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new NotFoundException("Product", itemRequest.productId()));
            StorageLocation location = storageLocationRepository
                    .findByWarehouseIdAndId(warehouse.getId(), itemRequest.storageLocationId())
                    .orElseThrow(() -> new BadRequestException(
                            "Storage location " + itemRequest.storageLocationId()
                                    + " does not belong to warehouse " + warehouse.getId()));
            OutboundOrderItem item = OutboundOrderItem.builder()
                    .product(product)
                    .storageLocation(location)
                    .requestedQuantity(itemRequest.requestedQuantity())
                    .build();
            order.addItem(item);
        }

        outboundOrderRepository.save(order);

        // Reserve stock for each item
        for (OutboundOrderItem item : order.getItems()) {
            inventoryService.reserveStock(item.getProduct().getId(),
                    item.getStorageLocation().getId(),
                    item.getRequestedQuantity());
        }

        auditLogService.record("OUTBOUND_CREATED", "OUTBOUND_ORDER", order.getId());
        return OutboundOrderDto.detail(order);
    }

    @Transactional
    public OutboundOrderDto dispatch(Long id) {
        OutboundOrder order = outboundOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Outbound order", id));
        if (order.getStatus() != OutboundStatus.DRAFT) {
            throw new ConflictException("Outbound order is already " + order.getStatus());
        }

        User actor = userRepository.getReferenceById(SecurityUtils.currentUserId());
        Instant now = Instant.now();

        for (OutboundOrderItem item : order.getItems()) {
            Long productId = item.getProduct().getId();
            Long locationId = item.getStorageLocation().getId();

            InventoryBalance balance = inventoryBalanceRepository
                    .findByProductIdAndStorageLocationId(productId, locationId)
                    .orElseThrow(() -> new ConflictException(
                            "Insufficient stock for product at location"));
            if (balance.getQuantityOnHand() < item.getRequestedQuantity()) {
                throw new ConflictException(
                        "Insufficient stock for product '" + item.getProduct().getSku() + "'");
            }
            balance.setQuantityOnHand(balance.getQuantityOnHand() - item.getRequestedQuantity());
            balance.setReservedQuantity(balance.getReservedQuantity() - item.getRequestedQuantity());
            inventoryBalanceRepository.save(balance);

            InventoryMovement movement = InventoryMovement.builder()
                    .product(item.getProduct())
                    .storageLocation(item.getStorageLocation())
                    .movementType(MovementType.OUTBOUND)
                    .quantityDelta(-item.getRequestedQuantity())
                    .referenceType(MovementReferenceType.OUTBOUND_ORDER)
                    .referenceId(order.getId())
                    .performedBy(actor)
                    .occurredAt(now)
                    .build();
            inventoryMovementRepository.save(movement);
        }

        order.setStatus(OutboundStatus.DISPATCHED);
        order.setRequestedAt(now);
        outboundOrderRepository.save(order);
        auditLogService.record("OUTBOUND_DISPATCHED", "OUTBOUND_ORDER", order.getId());
        return OutboundOrderDto.detail(order);
    }

    @Transactional
    public OutboundOrderDto cancel(Long id) {
        OutboundOrder order = outboundOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Outbound order", id));
        if (order.getStatus() != OutboundStatus.DRAFT) {
            throw new ConflictException("Cannot cancel outbound order in status " + order.getStatus());
        }

        // Release reserved stock for each item
        for (OutboundOrderItem item : order.getItems()) {
            inventoryService.releaseStock(item.getProduct().getId(),
                    item.getStorageLocation().getId(),
                    item.getRequestedQuantity());
        }

        order.setStatus(OutboundStatus.CANCELLED);
        outboundOrderRepository.save(order);
        auditLogService.record("OUTBOUND_CANCELLED", "OUTBOUND_ORDER", order.getId());
        return OutboundOrderDto.detail(order);
    }
}
