package com.shelly.freelancetaxmanager.repository;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// creates real tables in H2 and runs real SQL — no mocks
@DataJpaTest
class IncomeSourceRepositoryTest {

    @Autowired
    private IncomeSourceRepository incomeSourceRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");
        userRepository.save(user);
    }

    @Test
    void findByUserUserId_returnsSourcesForCorrectUser() {
        // Arrange
        IncomeSource source = new IncomeSource();
        source.setUser(user);
        source.setName("Acme Corp");
        source.setPaymentType(PaymentType.HOURLY);
        source.setHourlyRate(new BigDecimal("75.00"));
        incomeSourceRepository.save(source);

        // Act
        List<IncomeSource> results = incomeSourceRepository.findByUserUserId(user.getUserId());

        // Assert
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Acme Corp");
        assertThat(results.get(0).getPaymentType()).isEqualTo(PaymentType.HOURLY);
    }

    @Test
    void findByUserUserId_returnsEmptyList_whenUserHasNoSources() {
        // Arrange — second user with no sources
        User otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@test.com");
        otherUser.setCountry("LT");
        otherUser.setCurrency("EUR");
        userRepository.save(otherUser);

        // Act
        List<IncomeSource> results = incomeSourceRepository.findByUserUserId(otherUser.getUserId());

        // Assert
        assertThat(results).isEmpty();
    }

    @Test
    void findByUserUserId_doesNotReturnOtherUsersSources() {
        // Arrange — source belongs to default user
        IncomeSource source = new IncomeSource();
        source.setUser(user);
        source.setName("Acme Corp");
        source.setPaymentType(PaymentType.FIXED);
        incomeSourceRepository.save(source);

        // create second user with no sources
        User otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@test.com");
        otherUser.setCountry("LT");
        otherUser.setCurrency("EUR");
        userRepository.save(otherUser);

        // Act — query for other user's sources
        List<IncomeSource> results = incomeSourceRepository.findByUserUserId(otherUser.getUserId());

        // Assert — should not see the default user's source
        assertThat(results).isEmpty();
    }
}