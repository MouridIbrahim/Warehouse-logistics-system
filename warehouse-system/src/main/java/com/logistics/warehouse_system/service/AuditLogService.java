package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.AuditDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.entities.AuditLog;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.repository.AuditLogRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository,
                           UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void record(String action, String entityType, Long entityId) {
        record(action, entityType, entityId, (String) null);
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

    @Transactional
    public void record(String action, String entityType, Long entityId, Long actorId) {
        User actor = actorId == null ? null : userRepository.getReferenceById(actorId);
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .occurredAt(Instant.now())
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditDto> list(String entityType, String action, Long actorUserId,
                                       Instant from, Instant to, Pageable pageable) {
        Specification<AuditLog> spec = null;
        if (entityType != null || action != null || actorUserId != null || from != null || to != null) {
            spec = Specification.where((root, query, cb) -> {
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
                if (entityType != null) {
                    predicates.add(cb.equal(root.get("entityType"), entityType));
                }
                if (action != null) {
                    predicates.add(cb.equal(root.get("action"), action));
                }
                if (actorUserId != null) {
                    predicates.add(cb.equal(root.get("actor").get("id"), actorUserId));
                }
                if (from != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), from));
                }
                if (to != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), to));
                }
                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            });
        }

        Page<AuditLog> page = spec != null
                ? auditLogRepository.findAll(spec, pageable)
                : auditLogRepository.findAll(pageable);
        List<AuditDto> content = page.getContent().stream().map(AuditDto::from).toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> exportAll(String entityType, String action, Long actorUserId,
                                               Instant from, Instant to) {
        Specification<AuditLog> spec = Specification.where((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (entityType != null) {
                predicates.add(cb.equal(root.get("entityType"), entityType));
            }
            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (actorUserId != null) {
                predicates.add(cb.equal(root.get("actor").get("id"), actorUserId));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), to));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        });

        List<AuditLog> logs = auditLogRepository.findAll(spec);
        return logs.stream().map(l -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", l.getId());
            map.put("action", l.getAction());
            map.put("entityType", l.getEntityType());
            map.put("entityId", l.getEntityId());
            map.put("actorId", l.getActor() != null ? l.getActor().getId() : null);
            map.put("actorName", l.getActor() != null ? l.getActor().getDisplayName() : "");
            map.put("occurredAt", l.getOccurredAt() != null ? l.getOccurredAt().toString() : "");
            map.put("metadata", l.getMetadata() != null ? l.getMetadata() : "");
            return map;
        }).toList();
    }
}
