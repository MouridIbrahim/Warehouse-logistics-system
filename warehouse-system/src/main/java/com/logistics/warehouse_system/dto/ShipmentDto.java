package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.Shipment;

import java.time.Instant;

public record ShipmentDto(
        Long id,
        String trackingNumber,
        Long outboundOrderId,
        String outboundReferenceNumber,
        String carrierName,
        String status,
        Instant shippedAt,
        Instant deliveredAt,
        Instant createdAt,
        Instant updatedAt) {

    public static ShipmentDto from(Shipment shipment) {
        return new ShipmentDto(
                shipment.getId(),
                shipment.getTrackingNumber(),
                shipment.getOutboundOrder().getId(),
                shipment.getOutboundOrder().getReferenceNumber(),
                shipment.getCarrierName(),
                shipment.getStatus().name(),
                shipment.getShippedAt(),
                shipment.getDeliveredAt(),
                shipment.getCreatedAt(),
                shipment.getUpdatedAt());
    }
}
