package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @EntityGraph(attributePaths = "actor")
    @Query("""
            select a from AuditLog a
            where (:entityType is null or a.entityType = :entityType)
              and (:action is null or a.action = :action)
            order by a.occurredAt desc, a.id desc
            """)
    Page<AuditLog> search(@Param("entityType") String entityType,
                          @Param("action") String action,
                          Pageable pageable);
}
