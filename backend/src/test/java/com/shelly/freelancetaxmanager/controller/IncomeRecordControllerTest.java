package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.service.IncomeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

//boots only web layers, does not start or create a database
@WebMvcTest(IncomeRecordController.class)
class IncomeRecordControllerTest {

    @Autowired //fake http client
    private MockMvc mockMvc;

    //mocks the service, does not start the real service, but allows us to define its behavior in tests
    @MockitoBean
    private IncomeService incomeService;

    private IncomeRecord incomeRecord;

    @BeforeEach
    void setUp() {
        com.shelly.freelancetaxmanager.entity.User user =
                new com.shelly.freelancetaxmanager.entity.User();
        user.setFullName("Default User");
        user.setEmail("default@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");

        com.shelly.freelancetaxmanager.entity.IncomeSource incomeSource =
                new com.shelly.freelancetaxmanager.entity.IncomeSource();
        incomeSource.setName("Default Source");

        incomeRecord = new IncomeRecord();
        incomeRecord.setIncomeId(1L);
        incomeRecord.setAmount(new BigDecimal("1000.00"));
        incomeRecord.setIncomeDate(LocalDate.of(2026, 1, 1));
        incomeRecord.setUser(user);
        incomeRecord.setIncomeSource(incomeSource);
    }

    @Test
    void createIncomeRecord_returns201_withValidInput() throws Exception {
        when(incomeService.createIncomeRecord(any(IncomeRecord.class))).thenReturn(incomeRecord);

        mockMvc.perform(post("/api/income-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "amount": 1000.00,
                            "incomeDate": "2026-01-01"
                        }
                        """))
                .andExpect(status().is(201))
                .andExpect(jsonPath("$.incomeId").value(1));
    }

    @Test
    void createIncomeRecord_returns400_whenAmountIsNull() throws Exception {
        mockMvc.perform(post("/api/income-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "incomeDate": "2026-01-01"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createIncomeRecord_returns400_whenAmountIsNegative() throws Exception {
        mockMvc.perform(post("/api/income-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "amount": -500,
                            "incomeDate": "2026-01-01"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getIncomeRecordById_returns200_withValidId() throws Exception {
        when(incomeService.getIncomeRecordById(1L)).thenReturn(incomeRecord);

        mockMvc.perform(get("/api/income-records/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incomeId").value(1))
                .andExpect(jsonPath("$.currency").value("EUR"));
    }

    @Test
    void deleteIncomeRecord_returns200_withValidId() throws Exception {
        when(incomeService.deleteIncomeRecord(1L)).thenReturn(incomeRecord);

        mockMvc.perform(delete("/api/income-records/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incomeId").value(1));
    }

    @Test
    void getIncomeRecordsByUser_returns200_withValidUserId() throws Exception {
        when(incomeService.getIncomeRecordsByUser(1L)).thenReturn(List.of(incomeRecord));

        mockMvc.perform(get("/api/income-records").param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].incomeId").value(1));
    }
}