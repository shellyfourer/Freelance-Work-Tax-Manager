package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeRecordRepository;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class IncomeRecordServiceImplTest {

    @Mock private IncomeRecordRepository incomeRecordRepository;
    @Mock private IncomeSourceRepository incomeSourceRepository;
    @InjectMocks private IncomeRecordServiceImpl incomeService;

    private User user;
    private IncomeSource hourlySource;
    private IncomeSource fixedSource;
    private IncomeRecord incomeRecord;

    private static final Long HOURLY_SOURCE_ID = 1L;
    private static final Long FIXED_SOURCE_ID = 2L;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");

        hourlySource = new IncomeSource();
        hourlySource.setSourceId(HOURLY_SOURCE_ID);
        hourlySource.setName("Acme Corp");
        hourlySource.setPaymentType(PaymentType.HOURLY);
        hourlySource.setHourlyRate(new BigDecimal("50.00"));
        hourlySource.setUser(user);

        fixedSource = new IncomeSource();
        fixedSource.setSourceId(FIXED_SOURCE_ID);
        fixedSource.setName("Globex Project");
        fixedSource.setPaymentType(PaymentType.FIXED);
        fixedSource.setUser(user);

        incomeRecord = new IncomeRecord();
        incomeRecord.setAmount(new BigDecimal("500.00"));
        incomeRecord.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecord.setHoursWorked(new BigDecimal("10.00"));
        incomeRecord.setUser(user);
    }

    @Test
    void createIncomeRecord_savesRecordWithUserAndSource() {
        when(incomeSourceRepository.findById(HOURLY_SOURCE_ID)).thenReturn(Optional.of(hourlySource));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        IncomeRecord result = incomeService.createIncomeRecord(incomeRecord, HOURLY_SOURCE_ID, user);

        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getIncomeSource()).isEqualTo(hourlySource);
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(result.getHoursWorked()).isEqualByComparingTo(new BigDecimal("10.00"));
        assertThat(result.getIncomeDate()).isEqualTo(LocalDate.of(2026, 1, 1));
    }

    @Test
    void createIncomeRecord_throwsWhenHoursWorkedMissingForHourlySource() {
        incomeRecord.setHoursWorked(null);
        when(incomeSourceRepository.findById(HOURLY_SOURCE_ID)).thenReturn(Optional.of(hourlySource));

        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.createIncomeRecord(incomeRecord, HOURLY_SOURCE_ID, user)
        );
    }

    @Test
    void createIncomeRecord_throwsWhenAmountDoesNotMatchHoursTimesRate() {
        incomeRecord.setAmount(new BigDecimal("999.00"));
        when(incomeSourceRepository.findById(HOURLY_SOURCE_ID)).thenReturn(Optional.of(hourlySource));

        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.createIncomeRecord(incomeRecord, HOURLY_SOURCE_ID, user)
        );
    }

    @Test
    void createIncomeRecord_nullifiesHoursWorkedForFixedSource() {
        incomeRecord.setHoursWorked(new BigDecimal("10.00"));
        when(incomeSourceRepository.findById(FIXED_SOURCE_ID)).thenReturn(Optional.of(fixedSource));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        IncomeRecord result = incomeService.createIncomeRecord(incomeRecord, FIXED_SOURCE_ID, user);

        assertThat(result.getHoursWorked()).isNull();
    }

    @Test
    void updateIncomeRecord_overwritesOldValuesWithNewValues() {
        incomeRecord.setIncomeId(1L);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("100.00"));
        updatedRecord.setHoursWorked(new BigDecimal("2.00"));
        updatedRecord.setIncomeDate(LocalDate.of(2026, 6, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));
        when(incomeSourceRepository.findById(HOURLY_SOURCE_ID)).thenReturn(Optional.of(hourlySource));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        IncomeRecord result = incomeService.updateIncomeRecord(updatedRecord, HOURLY_SOURCE_ID, user);

        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(result.getHoursWorked()).isEqualByComparingTo(new BigDecimal("2.00"));
        assertThat(result.getIncomeDate()).isEqualTo(LocalDate.of(2026, 6, 1));
    }

    @Test
    void updateIncomeRecord_throwsWhenHoursWorkedMissingForHourlySource() {
        incomeRecord.setIncomeId(1L);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("500.00"));
        updatedRecord.setHoursWorked(null);
        updatedRecord.setIncomeDate(LocalDate.of(2026, 1, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));
        when(incomeSourceRepository.findById(HOURLY_SOURCE_ID)).thenReturn(Optional.of(hourlySource));

        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.updateIncomeRecord(updatedRecord, HOURLY_SOURCE_ID, user)
        );
    }

    @Test
    void updateIncomeRecord_throwsWhenAmountDoesNotMatchHoursTimesRate() {
        incomeRecord.setIncomeId(1L);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("999.00"));
        updatedRecord.setHoursWorked(new BigDecimal("2.00"));
        updatedRecord.setIncomeDate(LocalDate.of(2026, 1, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));
        when(incomeSourceRepository.findById(HOURLY_SOURCE_ID)).thenReturn(Optional.of(hourlySource));

        assertThrows(
                IllegalArgumentException.class,
                () -> incomeService.updateIncomeRecord(updatedRecord, HOURLY_SOURCE_ID, user)
        );
    }

    @Test
    void updateIncomeRecord_nullifiesHoursWorkedForFixedSource() {
        incomeRecord.setIncomeId(1L);

        IncomeRecord updatedRecord = new IncomeRecord();
        updatedRecord.setIncomeId(1L);
        updatedRecord.setAmount(new BigDecimal("500.00"));
        updatedRecord.setHoursWorked(new BigDecimal("10.00"));
        updatedRecord.setIncomeDate(LocalDate.of(2026, 1, 1));

        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));
        when(incomeSourceRepository.findById(FIXED_SOURCE_ID)).thenReturn(Optional.of(fixedSource));
        when(incomeRecordRepository.save(incomeRecord)).thenReturn(incomeRecord);

        IncomeRecord result = incomeService.updateIncomeRecord(updatedRecord, FIXED_SOURCE_ID, user);

        assertThat(result.getHoursWorked()).isNull();
    }

    @Test
    void deleteIncomeRecord_deletesRecord() {
        incomeRecord.setIncomeId(1L);
        when(incomeRecordRepository.findById(1L)).thenReturn(Optional.of(incomeRecord));

        incomeService.deleteIncomeRecord(1L, user);

        verify(incomeRecordRepository).delete(incomeRecord);
    }

    @Test
    void deleteIncomeRecord_throwsWhenRecordNotFound() {
        when(incomeRecordRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> incomeService.deleteIncomeRecord(99L, user)
        );
    }
}