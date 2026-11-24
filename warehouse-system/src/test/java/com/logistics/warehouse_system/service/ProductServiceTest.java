package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateProductRequest;
import com.logistics.warehouse_system.dto.ProductDto;
import com.logistics.warehouse_system.entities.Product;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock AuditLogService auditLogService;

    @InjectMocks ProductService productService;

    @Test
    void duplicateSkuIsRejected() {
        when(productRepository.existsBySku("SKU1")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(
                new CreateProductRequest("SKU1", "Product 1", null, "pcs", null)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void createSavesProduct() {
        when(productRepository.existsBySku("SKU1")).thenReturn(false);

        ProductDto dto = productService.create(
                new CreateProductRequest("SKU1", "Product 1", "desc", "pcs", null));

        assertThat(dto.sku()).isEqualTo("SKU1");
        assertThat(dto.name()).isEqualTo("Product 1");
        assertThat(dto.active()).isTrue();
        verify(productRepository).save(any(Product.class));
    }
}
