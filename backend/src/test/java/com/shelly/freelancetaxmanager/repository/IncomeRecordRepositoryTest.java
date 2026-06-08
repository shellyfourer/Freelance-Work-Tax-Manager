package com.shelly.freelancetaxmanager.repository;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

//creates real tables in our H2 and runs real sql, we do not mock
@DataJpaTest
class IncomeRecordRepositoryTest {

    @Autowired
    private IncomeRecordRepository incomeRecordRepository;

    @Autowired
    private IncomeSourceRepository incomeSourceRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;
    private IncomeSource incomeSource;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");
        userRepository.save(user);

        incomeSource = new IncomeSource();
        incomeSource.setName("Default Source");
        incomeSource.setPaymentType(com.shelly.freelancetaxmanager.enums.PaymentType.HOURLY);
        incomeSource.setHourlyRate(new BigDecimal("50.00"));
        incomeSource.setUser(user);
        incomeSourceRepository.save(incomeSource);
    }

    @Test
    void findByUserUserId_returnsRecordsForCorrectUser() {
        // Arrange
        IncomeRecord incomeRecord = new IncomeRecord();
        incomeRecord.setUser(user);
        incomeRecord.setIncomeSource(incomeSource);
        incomeRecord.setAmount(new BigDecimal("1000.00"));
        incomeRecord.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecordRepository.save(incomeRecord);

        // Act
        List<IncomeRecord> results = incomeRecordRepository.findByUserUserId(user.getUserId());

        // Assert
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    @Test
    void findByUserUserId_returnsEmptyList_whenUserHasNoRecords() {
        // Arrange — create a second user with no records
        User otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@test.com");
        otherUser.setCountry("LT");
        otherUser.setCurrency("EUR");
        userRepository.save(otherUser);

        // Act
        List<IncomeRecord> results = incomeRecordRepository.findByUserUserId(otherUser.getUserId());

        // Assert
        assertThat(results).isEmpty();
    }

    @Test
    void findByUserUserId_doesNotReturnOtherUsersRecords() {
        // Arrange — record belongs to default user
        IncomeRecord incomeRecord = new IncomeRecord();
        incomeRecord.setUser(user);
        incomeRecord.setIncomeSource(incomeSource);
        incomeRecord.setAmount(new BigDecimal("1000.00"));
        incomeRecord.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecordRepository.save(incomeRecord);

        // create second user
        User otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@test.com");
        otherUser.setCountry("LT");
        otherUser.setCurrency("EUR");
        userRepository.save(otherUser);

        // Act — query for other user's records
        List<IncomeRecord> results = incomeRecordRepository.findByUserUserId(otherUser.getUserId());

        // Assert — should not see the first user's record
        assertThat(results).isEmpty();
    }
}