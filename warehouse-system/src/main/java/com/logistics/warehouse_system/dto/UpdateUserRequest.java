package com.logistics.warehouse_system.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateUserRequest(
        @Size(max = 100) String displayName,
        Boolean active,
        List<@Size(max = 50) String> roles) {
}
