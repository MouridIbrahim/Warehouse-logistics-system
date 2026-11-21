package com.logistics.warehouse_system.config;

import com.logistics.warehouse_system.entities.Role;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.repository.RoleRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds development-only demo accounts on first startup so the permission
 * matrix can be exercised. These credentials are for local development only and
 * must never be enabled in production.
 */
@Slf4j
@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }
        createUser("admin", "admin123", "Administrator", "ADMINISTRATOR");
        createUser("manager", "manager123", "Warehouse Manager", "WAREHOUSE_MANAGER");
        createUser("employee", "employee123", "Warehouse Employee", "WAREHOUSE_EMPLOYEE");
        createUser("shipment", "shipment123", "Shipment Manager", "SHIPMENT_MANAGER");
        createUser("viewer", "viewer123", "Viewer / Auditor", "VIEWER_AUDITOR");
        log.warn("Seeded development-only demo accounts (admin/admin123, manager/manager123, "
                + "employee/employee123, shipment/shipment123, viewer/viewer123). "
                + "Do not use these credentials in production.");
    }

    private void createUser(String username, String rawPassword, String displayName, String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Seed role missing: " + roleName));
        User user = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .displayName(displayName)
                .active(true)
                .build();
        user.getRoles().add(role);
        userRepository.save(user);
    }
}
