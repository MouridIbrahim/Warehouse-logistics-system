package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = "roles")
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    @EntityGraph(attributePaths = "roles")
    @Query("select u from User u where u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);

    @Query("select count(u) > 0 from User u join u.roles r where r.name = :roleName")
    boolean existsByRoleName(@Param("roleName") String roleName);
}
