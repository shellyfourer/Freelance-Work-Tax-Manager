package com.shelly.freelancetaxmanager.service;


import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeRecordRepository;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.verify;

import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

//here we need to write mocks, because our service has dependencies, our 3 repositories

@ExtendWith(MockitoExtension.class)
public class IncomeServiceImplTest {

    @Mock private IncomeRecordRepository incomeRecordRepository;
    @Mock private IncomeSourceRepository incomeSourceRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private IncomeServiceImpl incomeService;

    private User user;
    private IncomeSource incomeSource;
    private IncomeRecord incomeRecord;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setFullName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");

        incomeSource = new IncomeSource();
        incomeSource.setName("Default Source");

        incomeRecord = new IncomeRecord();
        incomeRecord.setAmount(new BigDecimal("1000.00"));
        incomeRecord.setIncomeDate(LocalDate.of(2026, 1, 1));
    }

    @Test
    void createIncomeRecord_savesRecordWithDefaultUserAndSource() {
        // Arrange
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(incomeSourceRepository.findAll()).thenReturn(List.of(incomeSource));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        // Act
        IncomeRecord result = incomeService.createIncomeRecord(incomeRecord);

        // Assert
        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getIncomeSource()).isEqualTo(incomeSource);
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));
        assertThat(result.getIncomeDate()).isEqualTo(LocalDate.of(2026, 1, 1));
    }
    @Test
    void updateIncomeRecord_overwritesOldValuesWithNewValues() {
        // Arrange
        incomeRecord.setIncomeId(1L);

        // new values passed in by the caller
        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("2000.00"));
        updatedRecord.setIncomeDate(LocalDate.of(2026, 6, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        // Act
        IncomeRecord result = incomeService.updateIncomeRecord(updatedRecord);

        // Assert
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("2000.00"));
        assertThat(result.getIncomeDate()).isEqualTo(LocalDate.of(2026, 6, 1));
    }

    @Test
    void deleteIncomeRecord_deletesRecord() {
        // Arrange
        incomeRecord.setIncomeId(1L);
        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));

        // Act
        incomeService.deleteIncomeRecord(1L);

        // Assert
        verify(incomeRecordRepository).delete(incomeRecord);
    }

    @Test
    void deleteIncomeRecord_throwsWhenRecordNotFound() {
        // Arrange
        when(incomeRecordRepository.findById(99L)).thenReturn(Optional.empty());

        // Assert
        org.junit.jupiter.api.Assertions.assertThrows(
                ResourceNotFoundException.class,
                () -> incomeService.deleteIncomeRecord(99L)
        );
    }

}
