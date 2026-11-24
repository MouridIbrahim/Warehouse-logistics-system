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
import java.util.Map;

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
    public PageResponse<InventoryBalanceDto> listBalances(Long productId, Long locationId, String quantityCondition, Pageable pageable) {
        Page<InventoryBalance> page = inventoryBalanceRepository.search(productId, locationId, quantityCondition, pageable);
        List<InventoryBalanceDto> content = page.getContent().stream().map(InventoryBalanceDto::from).toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> exportBalances(Long productId, Long locationId, String quantityCondition) {
        List<InventoryBalance> balances = inventoryBalanceRepository.search(productId, locationId, quantityCondition,
                org.springframework.data.domain.Pageable.unpaged())
                .getContent();
        return balances.stream().map(b -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", b.getId());
            map.put("productId", b.getProduct().getId());
            map.put("productSku", b.getProduct().getSku());
            map.put("productName", b.getProduct().getName());
            map.put("locationId", b.getStorageLocation().getId());
            map.put("locationCode", b.getStorageLocation().getCode());
            map.put("quantityOnHand", b.getQuantityOnHand());
            map.put("reservedQuantity", b.getReservedQuantity());
            map.put("availableQuantity", b.getAvailableQuantity());
            map.put("updatedAt", b.getUpdatedAt() != null ? b.getUpdatedAt().toString() : "");
            return map;
        }).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryMovementDto> listMovements(Long productId, Long locationId, Pageable pageable) {
        Page<InventoryMovement> page = inventoryMovementRepository.search(productId, locationId, null, null, null, pageable);
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
        if (balance.getReservedQuantity() > newQuantity) {
            balance.setReservedQuantity(newQuantity);
        }
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

    @Transactional
    public InventoryBalanceDto reserveStock(Long productId, Long locationId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Reserved quantity must be positive");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product", productId));
        StorageLocation location = storageLocationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("Storage location", locationId));

        InventoryBalance balance = inventoryBalanceRepository
                .findByProductIdAndStorageLocationId(productId, locationId)
                .orElseThrow(() -> new NotFoundException("Inventory balance for this product and location"));

        if (!balance.canReserve(quantity)) {
            throw new ConflictException("Insufficient available stock for reservation");
        }

        balance.setReservedQuantity(balance.getReservedQuantity() + quantity);
        inventoryBalanceRepository.save(balance);

        auditLogService.record("INVENTORY_RESERVED", "INVENTORY_BALANCE", balance.getId(),
                "reserved " + quantity + " units");
        return InventoryBalanceDto.from(balance);
    }

    @Transactional
    public InventoryBalanceDto releaseStock(Long productId, Long locationId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Released quantity must be positive");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product", productId));
        StorageLocation location = storageLocationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("Storage location", locationId));

        InventoryBalance balance = inventoryBalanceRepository
                .findByProductIdAndStorageLocationId(productId, locationId)
                .orElseThrow(() -> new NotFoundException("Inventory balance for this product and location"));

        int newReserved = balance.getReservedQuantity() - quantity;
        if (newReserved < 0) {
            newReserved = 0;
        }
        balance.setReservedQuantity(newReserved);
        inventoryBalanceRepository.save(balance);

        auditLogService.record("INVENTORY_RESERVATION_RELEASED", "INVENTORY_BALANCE", balance.getId(),
                "released " + quantity + " units");
        return InventoryBalanceDto.from(balance);
    }

    @Transactional
    public InventoryBalanceDto cycleCount(Long productId, Long locationId, int countedQuantity, String notes) {
        if (countedQuantity < 0) {
            throw new BadRequestException("Counted quantity must not be negative");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product", productId));
        StorageLocation location = storageLocationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("Storage location", locationId));

        InventoryBalance balance = inventoryBalanceRepository
                .findByProductIdAndStorageLocationId(productId, locationId)
                .orElseThrow(() -> new NotFoundException("Inventory balance for this product and location"));

        int previousQuantity = balance.getQuantityOnHand();
        int delta = countedQuantity - previousQuantity;
        balance.setQuantityOnHand(countedQuantity);
        // A physical count must never leave reserved quantity above on-hand stock.
        balance.setReservedQuantity(Math.min(balance.getReservedQuantity(), countedQuantity));
        inventoryBalanceRepository.save(balance);

        InventoryMovement reversalMovement = InventoryMovement.builder()
                .product(product)
                .storageLocation(location)
                .movementType(MovementType.ADJUSTMENT)
                .quantityDelta(delta)
                .referenceType(MovementReferenceType.ADJUSTMENT)
                .referenceId(null)
                .performedBy(userRepository.getReferenceById(SecurityUtils.currentUserId()))
                .occurredAt(Instant.now())
                .notes("Cycle count: " + (notes != null ? notes : "Physical count"))
                .build();
        inventoryMovementRepository.save(reversalMovement);

        auditLogService.record("INVENTORY_CYCLE_COUNT", "INVENTORY_BALANCE", balance.getId(),
                "counted=" + countedQuantity + ", previous=" + previousQuantity + ", delta=" + delta);
        return InventoryBalanceDto.from(balance);
    }

    @Transactional
    public InventoryBalanceDto reverseAdjustment(Long movementId) {
        InventoryMovement movement = inventoryMovementRepository.findById(movementId)
                .orElseThrow(() -> new NotFoundException("Inventory movement", movementId));

        if (!MovementType.ADJUSTMENT.equals(movement.getMovementType())) {
            throw new BadRequestException("Only adjustment movements can be reversed");
        }
        if (inventoryMovementRepository.existsByReferenceIdAndMovementType(movementId, MovementType.ADJUSTMENT)) {
            throw new ConflictException("This adjustment has already been reversed");
        }

        Product product = movement.getProduct();
        StorageLocation location = movement.getStorageLocation();

        InventoryBalance balance = inventoryBalanceRepository
                .findByProductIdAndStorageLocationId(product.getId(), location.getId())
                .orElseThrow(() -> new NotFoundException("Inventory balance for this product and location"));

        int reversalDelta = -movement.getQuantityDelta();
        int newQuantity = balance.getQuantityOnHand() + reversalDelta;
        if (newQuantity < 0) {
            throw new ConflictException("Reversal would result in negative stock");
        }
        balance.setQuantityOnHand(newQuantity);
        if (balance.getReservedQuantity() > newQuantity) {
            balance.setReservedQuantity(newQuantity);
        }
        inventoryBalanceRepository.save(balance);

        InventoryMovement reversalMovement = InventoryMovement.builder()
                .product(product)
                .storageLocation(location)
                .movementType(MovementType.ADJUSTMENT)
                .quantityDelta(reversalDelta)
                .referenceType(MovementReferenceType.ADJUSTMENT)
                .referenceId(movement.getId())
                .performedBy(userRepository.getReferenceById(SecurityUtils.currentUserId()))
                .occurredAt(Instant.now())
                .notes("Reversal of movement #" + movement.getId())
                .build();
        inventoryMovementRepository.save(reversalMovement);

        auditLogService.record("INVENTORY_ADJUSTMENT_REVERSED", "INVENTORY_BALANCE", balance.getId(),
                "reversed movement #" + movement.getId() + " with delta " + reversalDelta);
        return InventoryBalanceDto.from(balance);
    }
}
