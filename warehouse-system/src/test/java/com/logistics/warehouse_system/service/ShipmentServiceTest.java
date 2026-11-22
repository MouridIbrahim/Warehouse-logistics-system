package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.UpdateShipmentStatusRequest;
import com.logistics.warehouse_system.entities.OutboundOrder;
import com.logistics.warehouse_system.entities.Shipment;
import com.logistics.warehouse_system.entities.ShipmentStatus;
import com.logistics.warehouse_system.entities.ShipmentStatusHistory;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.repository.OutboundOrderRepository;
import com.logistics.warehouse_system.repository.ShipmentRepository;
import com.logistics.warehouse_system.repository.ShipmentStatusHistoryRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock ShipmentRepository shipmentRepository;
    @Mock ShipmentStatusHistoryRepository shipmentStatusHistoryRepository;
    @Mock OutboundOrderRepository outboundOrderRepository;
    @Mock UserRepository userRepository;
    @Mock AuditLogService auditLogService;

    @InjectMocks ShipmentService shipmentService;

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

    private Shipment shipment(ShipmentStatus status) {
        OutboundOrder outboundOrder = new OutboundOrder();
        outboundOrder.setId(5L);
        outboundOrder.setReferenceNumber("OUT-001");

        Shipment shipment = new Shipment();
        shipment.setId(1L);
        shipment.setTrackingNumber("TRK-001");
        shipment.setStatus(status);
        shipment.setOutboundOrder(outboundOrder);
        return shipment;
    }

    @Test
    void invalidTransitionIsRejected() {
        Shipment shipment = shipment(ShipmentStatus.PENDING);
        when(shipmentRepository.findById(1L)).thenReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.updateStatus(
                1L, new UpdateShipmentStatusRequest(ShipmentStatus.DELIVERED, null)))
                .isInstanceOf(BadRequestException.class);

        verify(shipmentStatusHistoryRepository, never()).save(any());
        assertThat(shipment.getStatus()).isEqualTo(ShipmentStatus.PENDING);
    }

    @Test
    void validTransitionRecordsHistoryAndUpdatesStatus() {
        Shipment shipment = shipment(ShipmentStatus.PENDING);
        when(shipmentRepository.findById(1L)).thenReturn(Optional.of(shipment));

        shipmentService.updateStatus(1L, new UpdateShipmentStatusRequest(ShipmentStatus.PREPARED, "packed"));

        assertThat(shipment.getStatus()).isEqualTo(ShipmentStatus.PREPARED);

        ArgumentCaptor<ShipmentStatusHistory> captor = ArgumentCaptor.forClass(ShipmentStatusHistory.class);
        verify(shipmentStatusHistoryRepository).save(captor.capture());
        assertThat(captor.getValue().getPreviousStatus()).isEqualTo(ShipmentStatus.PENDING);
        assertThat(captor.getValue().getNewStatus()).isEqualTo(ShipmentStatus.PREPARED);
    }
}
