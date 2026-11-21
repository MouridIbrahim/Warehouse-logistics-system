package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    Page<Product> findBySkuContainingIgnoreCaseOrNameContainingIgnoreCase(
            String sku, String name, Pageable pageable);
}
