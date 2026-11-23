package com.logistics.warehouse_system.controller;

import com.logistics.warehouse_system.dto.AuditDto;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.service.AuditLogService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@Tag(name = "Audit Logs")
@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditController {

    private final AuditLogService auditLogService;

    public AuditController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','WAREHOUSE_MANAGER','VIEWER_AUDITOR')")
    public PageResponse<AuditDto> list(@RequestParam(required = false) String entityType,
                                       @RequestParam(required = false) String action,
                                       @RequestParam(required = false) Long actorUserId,
                                       @RequestParam(required = false) String from,
                                       @RequestParam(required = false) String to,
                                       @PageableDefault(size = 20) Pageable pageable) {
        Instant fromInstant = from != null ? Instant.parse(from + "T00:00:00Z") : null;
        Instant toInstant = to != null ? Instant.parse(to + "T23:59:59Z") : null;
        return auditLogService.list(entityType, action, actorUserId, fromInstant, toInstant, pageable);
    }
}
