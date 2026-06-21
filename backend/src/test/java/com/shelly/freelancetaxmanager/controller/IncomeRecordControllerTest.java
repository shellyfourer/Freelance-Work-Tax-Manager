package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.service.IncomeRecordService;
import com.shelly.freelancetaxmanager.service.OAuth2UserServiceImpl;
import com.shelly.freelancetaxmanager.service.UserService;
import com.shelly.freelancetaxmanager.config.SecurityConfig;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.context.annotation.Import;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = IncomeRecordController.class, excludeAutoConfiguration = OAuth2ClientWebSecurityAutoConfiguration.class)
@Import(SecurityConfig.class)
class IncomeRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IncomeRecordService incomeRecordService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private OAuth2UserServiceImpl oAuth2UserService;

    private User user;
    private IncomeRecord incomeRecord;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");

        IncomeSource incomeSource = new IncomeSource();
        incomeSource.setName("Acme Corp");
        incomeSource.setPaymentType(PaymentType.HOURLY);
        incomeSource.setHourlyRate(new BigDecimal("50.00"));

        incomeRecord = new IncomeRecord();
        incomeRecord.setIncomeId(1L);
        incomeRecord.setAmount(new BigDecimal("500.00"));
        incomeRecord.setHoursWorked(new BigDecimal("10.00"));
        incomeRecord.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecord.setUser(user);
        incomeRecord.setIncomeSource(incomeSource);

        when(userService.findByGoogleId(any())).thenReturn(user);
    }

    @Test
    void createIncomeRecord_returns201_withValidInput() throws Exception {
        when(incomeRecordService.createIncomeRecord(any(IncomeRecord.class), anyLong(), any(User.class))).thenReturn(incomeRecord);

        mockMvc.perform(post("/api/income-records")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "amount": 500.00,
                            "incomeDate": "2026-01-01",
                            "hoursWorked": 10.00,
                            "incomeSourceId": 1
                        }
                        """))
                .andExpect(status().is(201))
                .andExpect(jsonPath("$.incomeId").value(1))
                .andExpect(jsonPath("$.paymentType").value("HOURLY"));
    }

    @Test
    void createIncomeRecord_returns400_whenAmountIsNull() throws Exception {
        mockMvc.perform(post("/api/income-records")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "incomeDate": "2026-01-01",
                            "incomeSourceId": 1
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createIncomeRecord_returns400_whenAmountIsNegative() throws Exception {
        mockMvc.perform(post("/api/income-records")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "amount": -500,
                            "incomeDate": "2026-01-01",
                            "incomeSourceId": 1
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createIncomeRecord_returns400_whenIncomeSourceIdIsNull() throws Exception {
        mockMvc.perform(post("/api/income-records")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "amount": 500.00,
                            "incomeDate": "2026-01-01"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getIncomeRecordById_returns200_withValidId() throws Exception {
        when(incomeRecordService.getIncomeRecordById(1L, user)).thenReturn(incomeRecord);

        mockMvc.perform(get("/api/income-records/1")
                .with(oidcLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incomeId").value(1))
                .andExpect(jsonPath("$.hoursWorked").value(10.00));
    }

    @Test
    void deleteIncomeRecord_returns204_withValidId() throws Exception {
        doNothing().when(incomeRecordService).deleteIncomeRecord(1L, user);

        mockMvc.perform(delete("/api/income-records/1")
                .with(oidcLogin()).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void getIncomeRecordsByUser_returns200() throws Exception {
        when(incomeRecordService.getIncomeRecordsByUser(any(User.class))).thenReturn(List.of(incomeRecord));

        mockMvc.perform(get("/api/income-records")
                .with(oidcLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].incomeId").value(1))
                .andExpect(jsonPath("$[0].paymentType").value("HOURLY"));
    }
}