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
        Page<InboundOrder> page = inboundOrderRepository.search(term, status, warehouseId, from, to, pageable);
        List<InboundOrderDto> content = page.getContent().stream().map(InboundOrderDto::summary).toList();
        return PageResponse.of(page, content);
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
