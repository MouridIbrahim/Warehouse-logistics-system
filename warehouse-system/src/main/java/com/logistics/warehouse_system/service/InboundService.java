package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateInboundOrderItemRequest;
import com.logistics.warehouse_system.dto.CreateInboundOrderRequest;
import com.logistics.warehouse_system.dto.InboundOrderDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.entities.InboundOrder;
import com.logistics.warehouse_system.entities.InboundOrderItem;
import com.logistics.warehouse_system.entities.InboundStatus;
import com.logistics.warehouse_system.entities.InventoryBalance;
import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.MovementReferenceType;
import com.logistics.warehouse_system.entities.MovementType;
import com.logistics.warehouse_system.entities.Product;
import com.logistics.warehouse_system.entities.StorageLocation;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.entities.Warehouse;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.InboundOrderRepository;
import com.logistics.warehouse_system.repository.InventoryBalanceRepository;
import com.logistics.warehouse_system.repository.InventoryMovementRepository;
import com.logistics.warehouse_system.repository.OrderItemCount;
import com.logistics.warehouse_system.repository.ProductRepository;
import com.logistics.warehouse_system.repository.StorageLocationRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.repository.WarehouseRepository;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InboundService {

    private final InboundOrderRepository inboundOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final UserRepository userRepository;
    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final AuditLogService auditLogService;

    public InboundService(InboundOrderRepository inboundOrderRepository,
                          WarehouseRepository warehouseRepository,
                          ProductRepository productRepository,
                          StorageLocationRepository storageLocationRepository,
                          UserRepository userRepository,
                          InventoryBalanceRepository inventoryBalanceRepository,
                          InventoryMovementRepository inventoryMovementRepository,
                          AuditLogService auditLogService) {
        this.inboundOrderRepository = inboundOrderRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.storageLocationRepository = storageLocationRepository;
        this.userRepository = userRepository;
        this.inventoryBalanceRepository = inventoryBalanceRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<InboundOrderDto> list(String term, InboundStatus status, Long warehouseId,
                                              Instant from, Instant to, Pageable pageable) {
        Page<InboundOrder> page = inboundOrderRepository.findAll(
                searchSpec(term, status, warehouseId, from, to), pageable);
        Map<Long, Long> itemCounts = page.getContent().isEmpty()
                ? Map.of()
                : inboundOrderRepository.countItemsByOrderIds(
                                page.getContent().stream().map(InboundOrder::getId).toList())
                        .stream()
                        .collect(Collectors.toMap(OrderItemCount::orderId, OrderItemCount::itemCount));
        List<InboundOrderDto> content = page.getContent().stream()
                .map(order -> InboundOrderDto.summary(order, itemCounts.getOrDefault(order.getId(), 0L)))
                .toList();
        return PageResponse.of(page, content);
    }

    private Specification<InboundOrder> searchSpec(String term, InboundStatus status, Long warehouseId,
                                                   Instant from, Instant to) {
        return Specification.allOf(
                term == null || term.isBlank()
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.like(
                                cb.lower(root.get("referenceNumber")),
                                "%" + term.trim().toLowerCase(java.util.Locale.ROOT) + "%"),
                status == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(root.get("status"), status),
                warehouseId == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(root.get("warehouse").get("id"), warehouseId),
                from == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from),
                to == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> exportAll(String term, InboundStatus status, Long warehouseId,
                                               Instant from, Instant to) {
        List<InboundOrder> orders = inboundOrderRepository.findAll(
                searchSpec(term, status, warehouseId, from, to),
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return orders.stream().map(o -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", o.getId());
            map.put("referenceNumber", o.getReferenceNumber());
            map.put("warehouseId", o.getWarehouse().getId());
            map.put("status", o.getStatus());
            map.put("receivedAt", o.getReceivedAt() != null ? o.getReceivedAt().toString() : "");
            map.put("createdById", o.getCreatedBy() != null ? o.getCreatedBy().getId() : null);
            map.put("createdByName", o.getCreatedBy() != null ? o.getCreatedBy().getDisplayName() : "");
            map.put("notes", o.getNotes() != null ? o.getNotes() : "");
            map.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");
            map.put("updatedAt", o.getUpdatedAt() != null ? o.getUpdatedAt().toString() : "");
            return map;
        }).toList();
    }

    @Transactional(readOnly = true)
    public InboundOrderDto get(Long id) {
        InboundOrder order = inboundOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Inbound order", id));
        return InboundOrderDto.detail(order);
    }

    @Transactional
    public InboundOrderDto create(CreateInboundOrderRequest request) {
        if (inboundOrderRepository.existsByReferenceNumber(request.referenceNumber())) {
            throw new ConflictException("Reference number already exists: " + request.referenceNumber());
        }
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse", request.warehouseId()));
        User creator = userRepository.getReferenceById(SecurityUtils.currentUserId());

        InboundOrder order = InboundOrder.builder()
                .referenceNumber(request.referenceNumber())
                .warehouse(warehouse)
                .status(InboundStatus.DRAFT)
                .createdBy(creator)
                .notes(request.notes())
                .build();

        for (CreateInboundOrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new NotFoundException("Product", itemRequest.productId()));
            StorageLocation location = storageLocationRepository
                    .findByWarehouseIdAndId(warehouse.getId(), itemRequest.storageLocationId())
                    .orElseThrow(() -> new BadRequestException(
                            "Storage location " + itemRequest.storageLocationId()
                                    + " does not belong to warehouse " + warehouse.getId()));
            InboundOrderItem item = InboundOrderItem.builder()
                    .product(product)
                    .storageLocation(location)
                    .receivedQuantity(itemRequest.receivedQuantity())
                    .build();
            order.addItem(item);
        }

        inboundOrderRepository.save(order);
        auditLogService.record("INBOUND_CREATED", "INBOUND_ORDER", order.getId());
        return InboundOrderDto.detail(order);
    }

    @Transactional
    public InboundOrderDto confirm(Long id) {
        InboundOrder order = inboundOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new NotFoundException("Inbound order", id));
        if (order.getStatus() != InboundStatus.DRAFT) {
            throw new ConflictException("Inbound order is already " + order.getStatus());
        }

        User actor = userRepository.getReferenceById(SecurityUtils.currentUserId());
        Instant now = Instant.now();

        for (InboundOrderItem item : order.getItems()) {
            Long productId = item.getProduct().getId();
            Long locationId = item.getStorageLocation().getId();

            InventoryBalance balance = findOrCreateBalance(productId, locationId);
            balance.setQuantityOnHand(balance.getQuantityOnHand() + item.getReceivedQuantity());
            inventoryBalanceRepository.save(balance);

            InventoryMovement movement = InventoryMovement.builder()
                    .product(item.getProduct())
                    .storageLocation(item.getStorageLocation())
                    .movementType(MovementType.INBOUND)
                    .quantityDelta(item.getReceivedQuantity())
                    .referenceType(MovementReferenceType.INBOUND_ORDER)
                    .referenceId(order.getId())
                    .performedBy(actor)
                    .occurredAt(now)
                    .build();
            inventoryMovementRepository.save(movement);
        }

        order.setStatus(InboundStatus.CONFIRMED);
        order.setReceivedAt(now);
        inboundOrderRepository.save(order);
        auditLogService.record("INBOUND_CONFIRMED", "INBOUND_ORDER", order.getId());
        return InboundOrderDto.detail(order);
    }

    private InventoryBalance findOrCreateBalance(Long productId, Long locationId) {
        return inventoryBalanceRepository.findByProductIdAndStorageLocationId(productId, locationId)
                .orElseGet(() -> {
                    InventoryBalance balance = InventoryBalance.builder()
                            .product(productRepository.getReferenceById(productId))
                            .storageLocation(storageLocationRepository.getReferenceById(locationId))
                            .build();
                    return inventoryBalanceRepository.save(balance);
                });
    }
}
