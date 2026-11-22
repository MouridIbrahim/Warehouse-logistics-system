package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateAdjustmentRequest;
import com.logistics.warehouse_system.entities.InventoryBalance;
import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.MovementType;
import com.logistics.warehouse_system.entities.Product;
import com.logistics.warehouse_system.entities.StorageLocation;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.InventoryBalanceRepository;
import com.logistics.warehouse_system.repository.InventoryMovementRepository;
import com.logistics.warehouse_system.repository.ProductRepository;
import com.logistics.warehouse_system.repository.StorageLocationRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.AppUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock InventoryBalanceRepository inventoryBalanceRepository;
    @Mock InventoryMovementRepository inventoryMovementRepository;
    @Mock ProductRepository productRepository;
    @Mock StorageLocationRepository storageLocationRepository;
    @Mock UserRepository userRepository;
    @Mock AuditLogService auditLogService;

    @InjectMocks InventoryService inventoryService;

    @BeforeEach
    void setUpSecurity() {
        AppUserDetails principal = new AppUserDetails(1L, "tester", List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
        lenient().when(userRepository.getReferenceById(anyLong())).thenReturn(new User());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private InventoryBalance balance(int quantity) {
        Product product = new Product();
        product.setId(1L);
        product.setSku("SKU1");
        product.setName("Product 1");
        StorageLocation location = new StorageLocation();
        location.setId(2L);
        location.setCode("LOC1");

        InventoryBalance balance = new InventoryBalance();
        balance.setId(100L);
        balance.setProduct(product);
        balance.setStorageLocation(location);
        balance.setQuantityOnHand(quantity);
        return balance;
    }

    @Test
    void zeroDeltaIsRejected() {
        assertThatThrownBy(() -> inventoryService.adjust(
                new CreateAdjustmentRequest(1L, 2L, 0, null)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void adjustmentResultingInNegativeStockIsRejected() {
        InventoryBalance balance = balance(5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(balance.getProduct()));
        when(storageLocationRepository.findById(2L)).thenReturn(Optional.of(balance.getStorageLocation()));
        when(inventoryBalanceRepository.findByProductIdAndStorageLocationId(1L, 2L))
                .thenReturn(Optional.of(balance));

        assertThatThrownBy(() -> inventoryService.adjust(
                new CreateAdjustmentRequest(1L, 2L, -10, null)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void positiveAdjustmentUpdatesBalanceAndRecordsMovement() {
        InventoryBalance balance = balance(5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(balance.getProduct()));
        when(storageLocationRepository.findById(2L)).thenReturn(Optional.of(balance.getStorageLocation()));
        when(inventoryBalanceRepository.findByProductIdAndStorageLocationId(1L, 2L))
                .thenReturn(Optional.of(balance));

        inventoryService.adjust(new CreateAdjustmentRequest(1L, 2L, 5, "restock"));

        assertThat(balance.getQuantityOnHand()).isEqualTo(10);

        ArgumentCaptor<InventoryMovement> captor = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryMovementRepository).save(captor.capture());
        assertThat(captor.getValue().getMovementType()).isEqualTo(MovementType.ADJUSTMENT);
        assertThat(captor.getValue().getQuantityDelta()).isEqualTo(5);
    }

    @Test
    void adjustingMissingBalanceIsRejected() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(new Product()));
        when(storageLocationRepository.findById(2L)).thenReturn(Optional.of(new StorageLocation()));
        when(inventoryBalanceRepository.findByProductIdAndStorageLocationId(1L, 2L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.adjust(
                new CreateAdjustmentRequest(1L, 2L, 5, null)))
                .isInstanceOf(NotFoundException.class);
    }
}
