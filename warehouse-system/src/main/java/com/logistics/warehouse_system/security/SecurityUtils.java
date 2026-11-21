package com.logistics.warehouse_system.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AppUserDetails currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AppUserDetails details) {
            return details;
        }
        throw new AccessDeniedException("Not authenticated");
    }

    public static Long currentUserId() {
        return currentPrincipal().getId();
    }

    public static String currentUsername() {
        return currentPrincipal().getUsername();
    }
}
