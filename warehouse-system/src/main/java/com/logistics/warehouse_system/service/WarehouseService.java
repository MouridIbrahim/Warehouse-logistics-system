package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.CreateWarehouseRequest;
import com.logistics.warehouse_system.dto.PageResponse;
import com.logistics.warehouse_system.dto.UpdateWarehouseRequest;
import com.logistics.warehouse_system.dto.WarehouseDto;
import com.logistics.warehouse_system.entities.Warehouse;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.exception.NotFoundException;
import com.logistics.warehouse_system.repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final AuditLogService auditLogService;

    public WarehouseService(WarehouseRepository warehouseRepository, AuditLogService auditLogService) {
        this.warehouseRepository = warehouseRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PageResponse<WarehouseDto> list(String term, Boolean active, Instant from, Instant to, Pageable pageable) {
        Specification<Warehouse> spec = searchSpec(term, active, from, to);
        Page<Warehouse> page = warehouseRepository.findAll(spec, pageable);
        List<WarehouseDto> content = page.getContent().stream().map(WarehouseDto::from).toList();
        return PageResponse.of(page, content);
    }

    private Specification<Warehouse> searchSpec(String term, Boolean active, Instant from, Instant to) {
        return Specification.allOf(
                term == null || term.isBlank()
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.or(
                                cb.like(cb.lower(root.get("code")), "%" + term.trim().toLowerCase() + "%"),
                                cb.like(cb.lower(root.get("name")), "%" + term.trim().toLowerCase() + "%")),
                active == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.equal(root.get("active"), active),
                from == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from),
                to == null
                        ? Specification.unrestricted()
                        : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
    }

    @Transactional(readOnly = true)
    public long count() {
        return warehouseRepository.count();
    }

    @Transactional(readOnly = true)
    public WarehouseDto get(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Warehouse", id));
        return WarehouseDto.from(warehouse);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> exportAll(String term, Boolean active, Instant from, Instant to) {
        List<Warehouse> warehouses = warehouseRepository.findAll(
                searchSpec(term, active, from, to),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt", "id"));
        return warehouses.stream().map(w -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", w.getId());
            map.put("code", w.getCode());
            map.put("name", w.getName());
            map.put("address", w.getAddress() != null ? w.getAddress() : "");
            map.put("active", w.isActive() ? "Active" : "Inactive");
            map.put("createdAt", w.getCreatedAt() != null ? w.getCreatedAt().toString() : "");
            map.put("updatedAt", w.getUpdatedAt() != null ? w.getUpdatedAt().toString() : "");
            return map;
        }).toList();
    }

    @Transactional
    public WarehouseDto create(CreateWarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.code())) {
            throw new ConflictException("Warehouse code already exists: " + request.code());
        }
        Warehouse warehouse = Warehouse.builder()
                .code(request.code())
                .name(request.name())
                .address(request.address())
                .active(true)
                .build();
        warehouseRepository.save(warehouse);
        auditLogService.record("WAREHOUSE_CREATED", "WAREHOUSE", warehouse.getId());
        return WarehouseDto.from(warehouse);
    }

    @Transactional
    public WarehouseDto update(Long id, UpdateWarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Warehouse", id));

        if (request.code() != null && !request.code().equals(warehouse.getCode())) {
            if (warehouseRepository.existsByCode(request.code())) {
                throw new ConflictException("Warehouse code already exists: " + request.code());
            }
            warehouse.setCode(request.code());
        }
        if (request.name() != null) {
            warehouse.setName(request.name());
        }
        if (request.address() != null) {
            warehouse.setAddress(request.address());
        }
        if (request.active() != null) {
            warehouse.setActive(request.active());
        }

        warehouseRepository.save(warehouse);
        auditLogService.record("WAREHOUSE_UPDATED", "WAREHOUSE", warehouse.getId());
        return WarehouseDto.from(warehouse);
    }
}
