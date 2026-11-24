package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateProductRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.ProductDto;
import com.logistics.warehouse_system.dto.UpdateProductRequest;
import com.logistics.warehouse_system.entities.Product;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public ProductService(ProductRepository productRepository, AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> list(String term, String unitOfMeasure, Boolean active,
                                         Instant from, Instant to, Pageable pageable) {
        Page<Product> page = productRepository.search(term, unitOfMeasure, active, from, to, pageable);
        List<ProductDto> content = page.getContent().stream().map(ProductDto::from).toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> exportAll(String term, String unitOfMeasure, Boolean active,
                                               Instant from, Instant to) {
        List<Product> products = productRepository.search(term, unitOfMeasure, active, from, to,
                org.springframework.data.domain.Pageable.unpaged())
                .getContent();
        return products.stream().map(p -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", p.getId());
            map.put("sku", p.getSku());
            map.put("name", p.getName());
            map.put("description", p.getDescription() != null ? p.getDescription() : "");
            map.put("unitOfMeasure", p.getUnitOfMeasure() != null ? p.getUnitOfMeasure() : "");
            map.put("active", p.isActive() ? "Active" : "Inactive");
            map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
            map.put("updatedAt", p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : "");
            return map;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLowStockProducts() {
        List<Product> products = productRepository.findByLowStockThresholdGreaterThan(0);
        return products.stream().map(p -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", p.getId());
            map.put("sku", p.getSku());
            map.put("name", p.getName());
            map.put("description", p.getDescription() != null ? p.getDescription() : "");
            map.put("unitOfMeasure", p.getUnitOfMeasure() != null ? p.getUnitOfMeasure() : "");
            map.put("lowStockThreshold", p.getLowStockThreshold());
            map.put("active", p.isActive());
            return map;
        }).toList();
    }

    @Transactional(readOnly = true)
    public ProductDto get(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product", id));
        return ProductDto.from(product);
    }

    @Transactional
    public ProductDto create(CreateProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new ConflictException("SKU already exists: " + request.sku());
        }
        Product product = Product.builder()
                .sku(request.sku())
                .name(request.name())
                .description(request.description())
                .unitOfMeasure(request.unitOfMeasure())
                .lowStockThreshold(request.lowStockThreshold() != null ? request.lowStockThreshold() : 10)
                .active(true)
                .build();
        productRepository.save(product);
        auditLogService.record("PRODUCT_CREATED", "PRODUCT", product.getId());
        return ProductDto.from(product);
    }

    @Transactional
    public ProductDto update(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product", id));

        if (request.sku() != null && !request.sku().equals(product.getSku())) {
            if (productRepository.existsBySku(request.sku())) {
                throw new ConflictException("SKU already exists: " + request.sku());
            }
            product.setSku(request.sku());
        }
        if (request.name() != null) {
            product.setName(request.name());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.unitOfMeasure() != null) {
            product.setUnitOfMeasure(request.unitOfMeasure());
        }
        if (request.active() != null) {
            product.setActive(request.active());
        }
        if (request.lowStockThreshold() != null) {
            product.setLowStockThreshold(request.lowStockThreshold());
        }

        productRepository.save(product);
        auditLogService.record("PRODUCT_UPDATED", "PRODUCT", product.getId());
        return ProductDto.from(product);
    }
}
