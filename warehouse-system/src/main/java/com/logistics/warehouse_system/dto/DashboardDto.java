package com.logistics.warehouse_system.dto;

import java.util.List;

public record DashboardDto(
        long inboundVolume,
        long outboundVolume,
        long totalInventoryOnHand,
        long pendingInboundOrders,
        long pendingOutboundOrders,
        List<ShipmentStatusCount> shipmentStatusCounts) {
}
