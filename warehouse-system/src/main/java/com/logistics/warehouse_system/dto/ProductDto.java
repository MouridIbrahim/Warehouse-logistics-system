package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.Product;

import java.time.Instant;

public record ProductDto(
        Long id,
        String sku,
        String name,
        String description,
        String unitOfMeasure,
        Integer lowStockThreshold,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {

    public static ProductDto from(Product product) {
        return new ProductDto(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getUnitOfMeasure(),
                product.getLowStockThreshold(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
