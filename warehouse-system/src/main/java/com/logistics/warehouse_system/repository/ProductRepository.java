package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    Page<Product> findBySkuContainingIgnoreCaseOrNameContainingIgnoreCase(
            String sku, String name, Pageable pageable);

    @Query("""
            select p from Product p
            where (:term is null
                or lower(p.sku) like lower(concat('%', :term, '%'))
                or lower(p.name) like lower(concat('%', :term, '%')))
              and (:unitOfMeasure is null or p.unitOfMeasure = :unitOfMeasure)
              and (:active is null or p.active = :active)
              and (:from is null or p.createdAt >= :from)
              and (:to is null or p.createdAt <= :to)
            order by p.createdAt desc, p.id desc
            """)
    Page<Product> search(@Param("term") String term,
                         @Param("unitOfMeasure") String unitOfMeasure,
                         @Param("active") Boolean active,
                         @Param("from") Instant from,
                         @Param("to") Instant to,
                         Pageable pageable);
}
