package com.logistics.warehouse_system.service;

import com.logistics.warehouse_system.dto.ChangePasswordRequest;
import com.logistics.warehouse_system.dto.RegisterRequest;
import com.logistics.warehouse_system.dto.ResetPasswordRequest;
import com.logistics.warehouse_system.dto.UserDto;
import com.logistics.warehouse_system.entities.Role;
import com.logistics.warehouse_system.entities.User;
import com.logistics.warehouse_system.exception.BadRequestException;
import com.logistics.warehouse_system.exception.ConflictException;
import com.logistics.warehouse_system.repository.RoleRepository;
import com.logistics.warehouse_system.repository.UserRepository;
import com.logistics.warehouse_system.security.AppUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock RoleRepository roleRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuditLogService auditLogService;

    @InjectMocks UserService userService;

    @BeforeEach
    void setUpSecurity() {
        AppUserDetails principal = new AppUserDetails(1L, "tester", List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("user" + id);
        user.setDisplayName("User " + id);
        user.setActive(true);
        return user;
    }

    @Test
    void registerWhenNoAdminExistsCreatesAdministrator() {
        when(userRepository.existsByRoleName("ADMINISTRATOR")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        Role adminRole = new Role();
        adminRole.setId(1L);
        adminRole.setName("ADMINISTRATOR");
        when(roleRepository.findByName("ADMINISTRATOR")).thenReturn(Optional.of(adminRole));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        UserDto dto = userService.register(new RegisterRequest("alice", "password123", "Alice"));

        assertThat(dto.username()).isEqualTo("alice");
        assertThat(dto.roles()).containsExactly("ADMINISTRATOR");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerWhenAdminExistsIsRejected() {
        when(userRepository.existsByRoleName("ADMINISTRATOR")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(
                new RegisterRequest("alice", "password123", "Alice")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void registerWithDuplicateUsernameIsRejected() {
        when(userRepository.existsByRoleName("ADMINISTRATOR")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(
                new RegisterRequest("alice", "password123", "Alice")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void changeOwnPasswordWithWrongCurrentPasswordIsRejected() {
        User u = user(1L);
        u.setPasswordHash("old-hash");
        when(userRepository.findById(1L)).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("wrong", "old-hash")).thenReturn(false);

        assertThatThrownBy(() -> userService.changeOwnPassword(
                new ChangePasswordRequest("wrong", "newpassword123")))
                .isInstanceOf(BadRequestException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changeOwnPasswordUpdatesHash() {
        User u = user(1L);
        u.setPasswordHash("old-hash");
        when(userRepository.findById(1L)).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("oldpass", "old-hash")).thenReturn(true);
        when(passwordEncoder.encode("newpassword123")).thenReturn("new-hash");

        userService.changeOwnPassword(new ChangePasswordRequest("oldpass", "newpassword123"));

        assertThat(u.getPasswordHash()).isEqualTo("new-hash");
        verify(userRepository).save(u);
    }

    @Test
    void resetPasswordUpdatesHash() {
        User u = user(2L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(u));
        when(passwordEncoder.encode("newpassword123")).thenReturn("new-hash");

        userService.resetPassword(2L, new ResetPasswordRequest("newpassword123"));

        assertThat(u.getPasswordHash()).isEqualTo("new-hash");
        verify(userRepository).save(u);
    }
}
