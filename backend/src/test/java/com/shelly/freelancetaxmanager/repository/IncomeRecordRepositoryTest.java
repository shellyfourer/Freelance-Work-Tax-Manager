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
        user.setFullName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");
        userRepository.save(user);

        incomeSource = new IncomeSource();
        incomeSource.setName("Default Source");
        incomeSource.setUser(user);
        incomeSourceRepository.save(incomeSource);
    }

    @Test
    void findByUserUserId_returnsRecordsForCorrectUser() {
        // Arrange
        IncomeRecord record = new IncomeRecord();
        record.setUser(user);
        record.setIncomeSource(incomeSource);
        record.setAmount(new BigDecimal("1000.00"));
        record.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecordRepository.save(record);

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
        otherUser.setFullName("Other User");
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
        IncomeRecord record = new IncomeRecord();
        record.setUser(user);
        record.setIncomeSource(incomeSource);
        record.setAmount(new BigDecimal("1000.00"));
        record.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecordRepository.save(record);

        // create second user
        User otherUser = new User();
        otherUser.setFullName("Other User");
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