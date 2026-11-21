package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateAdjustmentRequest;
import com.logistics.warehouse_system.dto.InventoryBalanceDto;
import com.logistics.warehouse_system.dto.InventoryMovementDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.entities.InventoryBalance;
import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.MovementReferenceType;
import com.logistics.warehouse_system.entities.MovementType;
import com.logistics.warehouse_system.entities.Product;
import com.logistics.warehouse_system.entities.StorageLocation;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.InventoryBalanceRepository;
import com.logistics.warehouse_system.repository.InventoryMovementRepository;
import com.logistics.warehouse_system.repository.ProductRepository;
import com.logistics.warehouse_system.repository.StorageLocationRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final ProductRepository productRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public InventoryService(InventoryBalanceRepository inventoryBalanceRepository,
                            InventoryMovementRepository inventoryMovementRepository,
                            ProductRepository productRepository,
                            StorageLocationRepository storageLocationRepository,
                            UserRepository userRepository,
                            AuditLogService auditLogService) {
        this.inventoryBalanceRepository = inventoryBalanceRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.productRepository = productRepository;
        this.storageLocationRepository = storageLocationRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryBalanceDto> listBalances(Long productId, Long locationId, Pageable pageable) {
        Page<InventoryBalance> page = inventoryBalanceRepository.search(productId, locationId, pageable);
        List<InventoryBalanceDto> content = page.getContent().stream().map(InventoryBalanceDto::from).toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryMovementDto> listMovements(Long productId, Long locationId, Pageable pageable) {
        Page<InventoryMovement> page = inventoryMovementRepository.search(productId, locationId, pageable);
        List<InventoryMovementDto> content = page.getContent().stream().map(InventoryMovementDto::from).toList();
        return PageResponse.of(page, content);
    }

    @Transactional
    public InventoryBalanceDto adjust(CreateAdjustmentRequest request) {
        if (request.quantityDelta() == 0) {
            throw new BadRequestException("Quantity delta must not be zero");
        }
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new NotFoundException("Product", request.productId()));
        StorageLocation location = storageLocationRepository.findById(request.storageLocationId())
                .orElseThrow(() -> new NotFoundException("Storage location", request.storageLocationId()));

        InventoryBalance balance = inventoryBalanceRepository
                .findByProductIdAndStorageLocationId(request.productId(), request.storageLocationId())
                .orElseThrow(() -> new NotFoundException("Inventory balance for this product and location"));

        int newQuantity = balance.getQuantityOnHand() + request.quantityDelta();
        if (newQuantity < 0) {
            throw new ConflictException("Adjustment would result in negative stock");
        }
        balance.setQuantityOnHand(newQuantity);
        inventoryBalanceRepository.save(balance);

        InventoryMovement movement = InventoryMovement.builder()
                .product(product)
                .storageLocation(location)
                .movementType(MovementType.ADJUSTMENT)
                .quantityDelta(request.quantityDelta())
                .referenceType(MovementReferenceType.ADJUSTMENT)
                .performedBy(userRepository.getReferenceById(SecurityUtils.currentUserId()))
                .occurredAt(Instant.now())
                .notes(request.notes())
                .build();
        inventoryMovementRepository.save(movement);

        auditLogService.record("INVENTORY_ADJUSTED", "INVENTORY_BALANCE", balance.getId());
        return InventoryBalanceDto.from(balance);
    }
}
