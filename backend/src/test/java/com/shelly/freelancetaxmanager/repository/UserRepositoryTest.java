package com.shelly.freelancetaxmanager.repository;

import com.shelly.freelancetaxmanager.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setName("Shelly Fourer");
        user.setEmail("shelly@test.com");
        user.setGoogleId("google-123");
        userRepository.save(user);
    }

    @Test
    void findByGoogleId_returnsUser_whenGoogleIdExists() {
        Optional<User> result = userRepository.findByGoogleId("google-123");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("shelly@test.com");
    }

    @Test
    void findByGoogleId_returnsEmpty_whenGoogleIdDoesNotExist() {
        Optional<User> result = userRepository.findByGoogleId("nonexistent");

        assertThat(result).isEmpty();
    }

    @Test
    void findByEmail_returnsUser_whenEmailExists() {
        Optional<User> result = userRepository.findByEmail("shelly@test.com");

        assertThat(result).isPresent();
        assertThat(result.get().getGoogleId()).isEqualTo("google-123");
    }

    @Test
    void findByEmail_returnsEmpty_whenEmailDoesNotExist() {
        Optional<User> result = userRepository.findByEmail("unknown@test.com");

        assertThat(result).isEmpty();
    }

    @Test
    void findByGoogleId_doesNotReturnOtherUser() {
        User otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@test.com");
        otherUser.setGoogleId("google-456");
        userRepository.save(otherUser);

        Optional<User> result = userRepository.findByGoogleId("google-123");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("shelly@test.com");
    }
}