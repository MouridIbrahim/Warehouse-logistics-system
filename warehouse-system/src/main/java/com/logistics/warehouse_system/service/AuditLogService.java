package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.entities.AuditLog;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.repository.AuditLogRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void record(String action, String entityType, Long entityId) {
        record(action, entityType, entityId, null);
    }

    @Transactional
    public void record(String action, String entityType, Long entityId, String metadata) {
        Long actorId = SecurityUtils.currentUserId();
        User actor = userRepository.getReferenceById(actorId);
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .metadata(metadata)
                .occurredAt(Instant.now())
                .build();
        auditLogRepository.save(log);
    }
}
