package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    Optional<Warehouse> findByCode(String code);

    boolean existsByCode(String code);

    Page<Warehouse> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(
            String code, String name, Pageable pageable);

    @Query("""
            select w from Warehouse w
            where (:term is null
                or lower(w.code) like lower(concat('%', :term, '%'))
                or lower(w.name) like lower(concat('%', :term, '%')))
              and (:active is null or w.active = :active)
              and (:from is null or w.createdAt >= :from)
              and (:to is null or w.createdAt <= :to)
            order by w.createdAt desc, w.id desc
            """)
    Page<Warehouse> search(@Param("term") String term,
                           @Param("active") Boolean active,
                           @Param("from") Instant from,
                           @Param("to") Instant to,
                           Pageable pageable);
}
