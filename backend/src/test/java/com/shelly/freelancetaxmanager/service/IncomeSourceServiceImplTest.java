package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class IncomeSourceServiceImplTest {

    @Mock private IncomeSourceRepository incomeSourceRepository;
    @InjectMocks private IncomeSourceServiceImpl incomeSourceService;

    private User user;
    private IncomeSource incomeSource;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");

        incomeSource = new IncomeSource();
        incomeSource.setName("Acme Corp");
        incomeSource.setPaymentType(PaymentType.HOURLY);
        incomeSource.setHourlyRate(new BigDecimal("50.00"));
        incomeSource.setUser(user);
    }

    @Test
    void createIncomeSource_savesSourceWithUser() {
        when(incomeSourceRepository.save(incomeSource)).thenReturn(incomeSource);

        IncomeSource result = incomeSourceService.createIncomeSource(incomeSource, user);

        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getName()).isEqualTo("Acme Corp");
        assertThat(result.getPaymentType()).isEqualTo(PaymentType.HOURLY);
        assertThat(result.getHourlyRate()).isEqualByComparingTo(new BigDecimal("50.00"));
    }

    @Test
    void updateIncomeSource_overwritesNameAndPaymentType() {
        incomeSource.setSourceId(1L);

        IncomeSource updatedSource = new IncomeSource();
        updatedSource.setSourceId(1L);
        updatedSource.setName("Globex Corp");
        updatedSource.setDescription("Updated description");
        updatedSource.setPaymentType(PaymentType.FIXED);

        when(incomeSourceRepository.findById(1L)).thenReturn(Optional.of(incomeSource));
        when(incomeSourceRepository.save(incomeSource)).thenReturn(incomeSource);

        IncomeSource result = incomeSourceService.updateIncomeSource(updatedSource, user);

        assertThat(result.getName()).isEqualTo("Globex Corp");
        assertThat(result.getDescription()).isEqualTo("Updated description");
        assertThat(result.getPaymentType()).isEqualTo(PaymentType.FIXED);
    }

    @Test
    void deleteIncomeSource_deletesSource() {
        incomeSource.setSourceId(1L);
        when(incomeSourceRepository.findById(1L)).thenReturn(Optional.of(incomeSource));

        incomeSourceService.deleteIncomeSource(1L, user);

        verify(incomeSourceRepository).delete(incomeSource);
    }

    @Test
    void deleteIncomeSource_throwsWhenNotFound() {
        when(incomeSourceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> incomeSourceService.deleteIncomeSource(99L, user)
        );
    }

    @Test
    void createIncomeSource_throwsWhenHourlyRateIsMissingForHourlyType() {
        incomeSource.setPaymentType(PaymentType.HOURLY);
        incomeSource.setHourlyRate(null);

        assertThrows(
                IllegalArgumentException.class,
                () -> incomeSourceService.createIncomeSource(incomeSource, user)
        );
    }

    @Test
    void createIncomeSource_nullifiesHourlyRateForFixedType() {
        incomeSource.setPaymentType(PaymentType.FIXED);
        incomeSource.setHourlyRate(new BigDecimal("50.00"));
        when(incomeSourceRepository.save(incomeSource)).thenReturn(incomeSource);

        IncomeSource result = incomeSourceService.createIncomeSource(incomeSource, user);

        assertThat(result.getHourlyRate()).isNull();
    }
}
