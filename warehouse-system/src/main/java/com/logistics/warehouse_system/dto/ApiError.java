package com.logistics.warehouse_system.dto;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        int status,
        String code,
        String message,
        Map<String, String> fieldErrors,
        Instant timestamp) {

    public static ApiError of(int status, String code, String message) {
        return new ApiError(status, code, message, null, Instant.now());
    }

    public static ApiError of(int status, String code, String message, Map<String, String> fieldErrors) {
        return new ApiError(status, code, message, fieldErrors, Instant.now());
    }
}
