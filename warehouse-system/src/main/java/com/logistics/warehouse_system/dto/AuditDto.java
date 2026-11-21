package com.logistics.warehouse_system.dto;

import com.logistics.warehouse_system.entities.AuditLog;

import java.time.Instant;

public record AuditDto(
        Long id,
        String action,
        String entityType,
        Long entityId,
        Long actorId,
        String actorName,
        Instant occurredAt,
        String metadata) {

    public static AuditDto from(AuditLog log) {
        return new AuditDto(
                log.getId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getActor() == null ? null : log.getActor().getId(),
                log.getActor() == null ? null : log.getActor().getDisplayName(),
                log.getOccurredAt(),
                log.getMetadata());
    }
}
