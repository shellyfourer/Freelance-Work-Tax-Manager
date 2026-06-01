package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class IncomeRecordServiceImplTest {

    @Mock private IncomeRecordRepository incomeRecordRepository;
    @Mock private IncomeSourceRepository incomeSourceRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private IncomeRecordServiceImpl incomeService;

    private User user;
    private IncomeSource hourlySource;
    private IncomeSource fixedSource;
    private IncomeRecord incomeRecord;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");

        hourlySource = new IncomeSource();
        hourlySource.setName("Acme Corp");
        hourlySource.setPaymentType(PaymentType.HOURLY);
        hourlySource.setHourlyRate(new BigDecimal("50.00"));

        fixedSource = new IncomeSource();
        fixedSource.setName("Globex Project");
        fixedSource.setPaymentType(PaymentType.FIXED);

        incomeRecord = new IncomeRecord();
        incomeRecord.setAmount(new BigDecimal("500.00"));
        incomeRecord.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecord.setHoursWorked(new BigDecimal("10.00")); // 10h × €50 = €500
    }

    @Test
    void createIncomeRecord_savesRecordWithDefaultUserAndSource() {
        // Arrange
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(incomeSourceRepository.findAll()).thenReturn(List.of(hourlySource));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        // Act
        IncomeRecord result = incomeService.createIncomeRecord(incomeRecord);

        // Assert
        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getIncomeSource()).isEqualTo(hourlySource);
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(result.getHoursWorked()).isEqualByComparingTo(new BigDecimal("10.00"));
        assertThat(result.getIncomeDate()).isEqualTo(LocalDate.of(2026, 1, 1));
    }

    @Test
    void createIncomeRecord_throwsWhenHoursWorkedMissingForHourlySource() {
        // Arrange
        incomeRecord.setHoursWorked(null);
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(incomeSourceRepository.findAll()).thenReturn(List.of(hourlySource));

        // Assert
        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.createIncomeRecord(incomeRecord)
        );
    }

    @Test
    void createIncomeRecord_throwsWhenAmountDoesNotMatchHoursTimesRate() {
        // Arrange — 10h × €50 = €500, but amount is €999
        incomeRecord.setAmount(new BigDecimal("999.00"));
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(incomeSourceRepository.findAll()).thenReturn(List.of(hourlySource));

        // Assert
        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.createIncomeRecord(incomeRecord)
        );
    }

    @Test
    void createIncomeRecord_nullifiesHoursWorkedForFixedSource() {
        // Arrange — client sent hoursWorked but source is FIXED
        incomeRecord.setHoursWorked(new BigDecimal("10.00"));
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(incomeSourceRepository.findAll()).thenReturn(List.of(fixedSource));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        // Act
        IncomeRecord result = incomeService.createIncomeRecord(incomeRecord);

        // Assert
        assertThat(result.getHoursWorked()).isNull();
    }

    @Test
    void updateIncomeRecord_overwritesOldValuesWithNewValues() {
        // Arrange
        incomeRecord.setIncomeId(1L);
        incomeRecord.setIncomeSource(hourlySource);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("100.00")); // 2h × €50
        updatedRecord.setHoursWorked(new BigDecimal("2.00"));
        updatedRecord.setIncomeDate(LocalDate.of(2026, 6, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        // Act
        IncomeRecord result = incomeService.updateIncomeRecord(updatedRecord);

        // Assert
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(result.getHoursWorked()).isEqualByComparingTo(new BigDecimal("2.00"));
        assertThat(result.getIncomeDate()).isEqualTo(LocalDate.of(2026, 6, 1));
    }

    @Test
    void updateIncomeRecord_throwsWhenHoursWorkedMissingForHourlySource() {
        // Arrange
        incomeRecord.setIncomeId(1L);
        incomeRecord.setIncomeSource(hourlySource);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("500.00"));
        updatedRecord.setHoursWorked(null);
        updatedRecord.setIncomeDate(LocalDate.of(2026, 1, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));

        // Assert
        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.updateIncomeRecord(updatedRecord)
        );
    }

    @Test
    void updateIncomeRecord_throwsWhenAmountDoesNotMatchHoursTimesRate() {
        // Arrange — 2h × €50 = €100, but amount is €999
        incomeRecord.setIncomeId(1L);
        incomeRecord.setIncomeSource(hourlySource);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("999.00"));
        updatedRecord.setHoursWorked(new BigDecimal("2.00"));
        updatedRecord.setIncomeDate(LocalDate.of(2026, 1, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));

        // Assert
        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.updateIncomeRecord(updatedRecord)
        );
    }

    @Test
    void updateIncomeRecord_nullifiesHoursWorkedForFixedSource() {
        // Arrange — existing record linked to a FIXED source, client sends hoursWorked anyway
        incomeRecord.setIncomeId(1L);
        incomeRecord.setIncomeSource(fixedSource);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("500.00"));
        updatedRecord.setHoursWorked(new BigDecimal("10.00")); // should be ignored
        updatedRecord.setIncomeDate(LocalDate.of(2026, 1, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        // Act
        IncomeRecord result = incomeService.updateIncomeRecord(updatedRecord);

        // Assert
        assertThat(result.getHoursWorked()).isNull();
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
        assertThrows(
                ResourceNotFoundException.class,
                () -> incomeService.deleteIncomeRecord(99L)
        );
    }
}