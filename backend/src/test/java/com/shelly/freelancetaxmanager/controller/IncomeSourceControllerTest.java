package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.service.IncomeSourceService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = IncomeSourceController.class, excludeAutoConfiguration = OAuth2ClientWebSecurityAutoConfiguration.class)
@Import(SecurityConfig.class)
public class IncomeSourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IncomeSourceService incomeSourceService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private OAuth2UserServiceImpl oAuth2UserService;

    private User user;
    private IncomeSource incomeSource;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setName("Default User");
        user.setEmail("default@test.com");

        incomeSource = new IncomeSource();
        incomeSource.setSourceId(1L);
        incomeSource.setName("Acme Corp");
        incomeSource.setDescription("Hourly consulting work");
        incomeSource.setPaymentType(PaymentType.HOURLY);
        incomeSource.setHourlyRate(new BigDecimal("75.00"));

        when(userService.findByGoogleId(any())).thenReturn(user);
    }

    @Test
    void createIncomeSource_returns201_withValidInput() throws Exception {
        when(incomeSourceService.createIncomeSource(any(IncomeSource.class), any(User.class))).thenReturn(incomeSource);

        mockMvc.perform(post("/api/clients")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "name": "Acme Corp",
                            "paymentType": "HOURLY",
                            "hourlyRate": 75.00
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sourceId").value(1))
                .andExpect(jsonPath("$.name").value("Acme Corp"))
                .andExpect(jsonPath("$.paymentType").value("HOURLY"));
    }

    @Test
    void createIncomeSource_returns400_whenNameIsBlank() throws Exception {
        mockMvc.perform(post("/api/clients")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "name": "",
                            "paymentType": "HOURLY",
                            "hourlyRate": 75.00
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createIncomeSource_returns400_whenPaymentTypeIsNull() throws Exception {
        mockMvc.perform(post("/api/clients")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "name": "Acme Corp"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createIncomeSource_returns400_whenHourlyRateIsNegative() throws Exception {
        mockMvc.perform(post("/api/clients")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "name": "Acme Corp",
                            "paymentType": "HOURLY",
                            "hourlyRate": -50.00
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getIncomeSourceById_returns200_withValidId() throws Exception {
        when(incomeSourceService.getIncomeSourceById(1L, user)).thenReturn(incomeSource);

        mockMvc.perform(get("/api/clients/1")
                .with(oidcLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sourceId").value(1))
                .andExpect(jsonPath("$.name").value("Acme Corp"))
                .andExpect(jsonPath("$.paymentType").value("HOURLY"));
    }

    @Test
    void deleteIncomeSource_returns204_withValidId() throws Exception {
        doNothing().when(incomeSourceService).deleteIncomeSource(1L, user);

        mockMvc.perform(delete("/api/clients/1")
                .with(oidcLogin()).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void getIncomeSourcesByUser_returns200() throws Exception {
        when(incomeSourceService.getIncomeSourcesByUser(any(User.class))).thenReturn(List.of(incomeSource));

        mockMvc.perform(get("/api/clients")
                .with(oidcLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sourceId").value(1))
                .andExpect(jsonPath("$[0].name").value("Acme Corp"));
    }
}