package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.entities.InventoryBalance;
import com.logistics.warehouse_system.entities.InventoryMovement;
import com.logistics.warehouse_system.entities.MovementType;
import com.logistics.warehouse_system.entities.OutboundOrder;
import com.logistics.warehouse_system.entities.OutboundOrderItem;
import com.logistics.warehouse_system.entities.OutboundStatus;
import com.logistics.warehouse_system.entities.Product;
import com.logistics.warehouse_system.entities.StorageLocation;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.entities.Warehouse;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.repository.InventoryBalanceRepository;
import com.logistics.warehouse_system.repository.InventoryMovementRepository;
import com.logistics.warehouse_system.repository.OutboundOrderRepository;
import com.logistics.warehouse_system.repository.ProductRepository;
import com.logistics.warehouse_system.repository.StorageLocationRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.repository.WarehouseRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutboundServiceTest {

    @Mock OutboundOrderRepository outboundOrderRepository;
    @Mock WarehouseRepository warehouseRepository;
    @Mock ProductRepository productRepository;
    @Mock StorageLocationRepository storageLocationRepository;
    @Mock UserRepository userRepository;
    @Mock InventoryBalanceRepository inventoryBalanceRepository;
    @Mock InventoryMovementRepository inventoryMovementRepository;
    @Mock AuditLogService auditLogService;

    @InjectMocks OutboundService outboundService;

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

    private OutboundOrder draftOrder(int requestedQuantity) {
        Product product = new Product();
        product.setId(1L);
        product.setSku("SKU1");
        product.setName("Product 1");

        StorageLocation location = new StorageLocation();
        location.setId(2L);
        location.setCode("LOC1");

        OutboundOrderItem item = new OutboundOrderItem();
        item.setProduct(product);
        item.setStorageLocation(location);
        item.setRequestedQuantity(requestedQuantity);

        Warehouse warehouse = new Warehouse();
        warehouse.setId(1L);
        warehouse.setCode("WH1");

        User creator = new User();
        creator.setId(1L);
        creator.setDisplayName("Tester");

        OutboundOrder order = new OutboundOrder();
        order.setId(10L);
        order.setReferenceNumber("OUT-001");
        order.setWarehouse(warehouse);
        order.setStatus(OutboundStatus.DRAFT);
        order.setCreatedBy(creator);
        order.addItem(item);
        return order;
    }

    private InventoryBalance balance(int quantityOnHand) {
        InventoryBalance balance = new InventoryBalance();
        balance.setId(100L);
        balance.setProduct(new Product());
        balance.setStorageLocation(new StorageLocation());
        balance.setQuantityOnHand(quantityOnHand);
        return balance;
    }

    @Test
    void dispatchWithSufficientStockDecrementsAndRecordsMovement() {
        OutboundOrder order = draftOrder(6);
        InventoryBalance balance = balance(10);

        when(outboundOrderRepository.findByIdWithItems(10L)).thenReturn(Optional.of(order));
        when(inventoryBalanceRepository.findByProductIdAndStorageLocationId(1L, 2L))
                .thenReturn(Optional.of(balance));

        outboundService.dispatch(10L);

        assertThat(balance.getQuantityOnHand()).isEqualTo(4);
        assertThat(order.getStatus()).isEqualTo(OutboundStatus.DISPATCHED);

        ArgumentCaptor<InventoryMovement> captor = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryMovementRepository).save(captor.capture());
        InventoryMovement movement = captor.getValue();
        assertThat(movement.getMovementType()).isEqualTo(MovementType.OUTBOUND);
        assertThat(movement.getQuantityDelta()).isEqualTo(-6);
        assertThat(movement.getReferenceId()).isEqualTo(10L);
    }

    @Test
    void dispatchWithInsufficientStockFailsWithoutSideEffects() {
        OutboundOrder order = draftOrder(6);
        InventoryBalance balance = balance(3);

        when(outboundOrderRepository.findByIdWithItems(10L)).thenReturn(Optional.of(order));
        when(inventoryBalanceRepository.findByProductIdAndStorageLocationId(1L, 2L))
                .thenReturn(Optional.of(balance));

        assertThatThrownBy(() -> outboundService.dispatch(10L))
                .isInstanceOf(ConflictException.class);

        assertThat(order.getStatus()).isEqualTo(OutboundStatus.DRAFT);
        assertThat(balance.getQuantityOnHand()).isEqualTo(3);
        verify(inventoryMovementRepository, never()).save(any());
    }

    @Test
    void dispatchAlreadyDispatchedFails() {
        OutboundOrder order = draftOrder(6);
        order.setStatus(OutboundStatus.DISPATCHED);

        when(outboundOrderRepository.findByIdWithItems(10L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> outboundService.dispatch(10L))
                .isInstanceOf(ConflictException.class);
    }
}
