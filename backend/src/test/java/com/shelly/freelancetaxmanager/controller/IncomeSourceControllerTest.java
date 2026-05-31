package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.service.IncomeSourceService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncomeSourceController.class)
public class IncomeSourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IncomeSourceService incomeSourceService;

    private IncomeSource incomeSource;

    @BeforeEach
    void setUp() {
        incomeSource = new IncomeSource();
        incomeSource.setSourceId(1L);
        incomeSource.setName("Acme Corp");
        incomeSource.setDescription("Hourly consulting work");
        incomeSource.setPaymentType(PaymentType.HOURLY);
        incomeSource.setHourlyRate(new BigDecimal("75.00"));
    }

    @Test
    void createIncomeSource_returns201_withValidInput() throws Exception {
        when(incomeSourceService.createIncomeSource(any(IncomeSource.class))).thenReturn(incomeSource);

        mockMvc.perform(post("/api/clients")
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
        when(incomeSourceService.getIncomeSourceById(1L)).thenReturn(incomeSource);

        mockMvc.perform(get("/api/clients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sourceId").value(1))
                .andExpect(jsonPath("$.name").value("Acme Corp"))
                .andExpect(jsonPath("$.paymentType").value("HOURLY"));
    }

    @Test
    void deleteIncomeSource_returns204_withValidId() throws Exception {
        doNothing().when(incomeSourceService).deleteIncomeSource(1L);

        mockMvc.perform(delete("/api/clients/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getIncomeSourcesByUser_returns200_withValidUserId() throws Exception {
        when(incomeSourceService.getIncomeSourcesByUser(1L)).thenReturn(List.of(incomeSource));

        mockMvc.perform(get("/api/clients").param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sourceId").value(1))
                .andExpect(jsonPath("$[0].name").value("Acme Corp"));
    }
}