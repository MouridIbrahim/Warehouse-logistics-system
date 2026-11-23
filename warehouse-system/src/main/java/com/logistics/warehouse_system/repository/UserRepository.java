package com.logistics.warehouse_system.repository;

import com.logistics.warehouse_system.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("""
            select u from User u
            where (:term is null
                or lower(u.username) like lower(concat('%', :term, '%'))
                or lower(u.displayName) like lower(concat('%', :term, '%')))
              and (:role is null or exists (
                select 1 from u.roles r where r.name = :role))
              and (:active is null or u.active = :active)
            """)
    Page<User> search(@Param("term") String term,
                      @Param("role") String role,
                      @Param("active") Boolean active,
                      Pageable pageable);

    @EntityGraph(attributePaths = "roles")
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    @EntityGraph(attributePaths = "roles")
    @Query("select u from User u where u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);

    @Query("select count(u) > 0 from User u join u.roles r where r.name = :roleName")
    boolean existsByRoleName(@Param("roleName") String roleName);
}
