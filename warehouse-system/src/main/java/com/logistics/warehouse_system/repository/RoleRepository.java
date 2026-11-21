package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

    List<Role> findByNameIn(Collection<String> names);
}
