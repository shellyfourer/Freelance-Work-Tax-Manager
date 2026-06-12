package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private OidcUser oidcUser;
    @InjectMocks private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setName("Shelly Fourer");
        user.setEmail("shelly@test.com");
        user.setGoogleId("google-123");
    }

    @Test
    void findOrCreateByGoogleId_returnsExistingUser_whenGoogleIdFound() {
        // Arrange
        when(oidcUser.getSubject()).thenReturn("google-123");
        when(oidcUser.getEmail()).thenReturn("shelly@test.com");
        when(oidcUser.getFullName()).thenReturn("Shelly Fourer");
        when(userRepository.findByGoogleId("google-123")).thenReturn(Optional.of(user));

        // Act
        User result = userService.findOrCreateByGoogleId(oidcUser);

        // Assert
        assertThat(result.getEmail()).isEqualTo("shelly@test.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void findOrCreateByGoogleId_linksGoogleId_whenEmailExistsWithoutGoogleId() {
        // Arrange
        User existingUser = new User();
        existingUser.setName("Shelly Fourer");
        existingUser.setEmail("shelly@test.com");

        when(oidcUser.getSubject()).thenReturn("google-123");
        when(oidcUser.getEmail()).thenReturn("shelly@test.com");
        when(oidcUser.getFullName()).thenReturn("Shelly Fourer");
        when(userRepository.findByGoogleId("google-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("shelly@test.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        // Act
        User result = userService.findOrCreateByGoogleId(oidcUser);

        // Assert
        assertThat(result.getGoogleId()).isEqualTo("google-123");
        verify(userRepository).save(existingUser);
    }

    @Test
    void findOrCreateByGoogleId_createsNewUser_whenNeitherGoogleIdNorEmailFound() {
        // Arrange
        when(oidcUser.getSubject()).thenReturn("google-123");
        when(oidcUser.getEmail()).thenReturn("shelly@test.com");
        when(oidcUser.getFullName()).thenReturn("Shelly Fourer");
        when(userRepository.findByGoogleId("google-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("shelly@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        User result = userService.findOrCreateByGoogleId(oidcUser);

        // Assert
        assertThat(result.getEmail()).isEqualTo("shelly@test.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void findByGoogleId_returnsUser_whenFound() {
        // Arrange
        when(userRepository.findByGoogleId("google-123")).thenReturn(Optional.of(user));

        // Act
        User result = userService.findByGoogleId("google-123");

        // Assert
        assertThat(result.getEmail()).isEqualTo("shelly@test.com");
    }

    @Test
    void findByGoogleId_throws_whenNotFound() {
        // Arrange
        when(userRepository.findByGoogleId("nonexistent")).thenReturn(Optional.empty());

        // Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.findByGoogleId("nonexistent"));
    }

    @Test
    void setup_savesCountryAndCurrency() {
        // Arrange
        when(userRepository.findByGoogleId("google-123")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        // Act
        userService.setup("google-123", "LT", "EUR");

        // Assert
        assertThat(user.getCountry()).isEqualTo("LT");
        assertThat(user.getCurrency()).isEqualTo("EUR");
        verify(userRepository).save(user);
    }
}