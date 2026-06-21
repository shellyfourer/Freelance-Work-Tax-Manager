package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.config.SecurityConfig;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;
import com.shelly.freelancetaxmanager.dto.TaxLineItemDto;
import com.shelly.freelancetaxmanager.service.OAuth2UserServiceImpl;
import com.shelly.freelancetaxmanager.service.TaxService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = TaxController.class, excludeAutoConfiguration = OAuth2ClientWebSecurityAutoConfiguration.class)
@Import(SecurityConfig.class)
class TaxControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaxService taxService;

    @MockitoBean
    private OAuth2UserServiceImpl oAuth2UserService;

    @Test
    void calculate_returns200_withValidInput() throws Exception {
        TaxCalculationResponseDto response = new TaxCalculationResponseDto(
                new BigDecimal("5000.00"),
                new BigDecimal("3800.00"),
                new BigDecimal("1200.00"),
                List.of(new TaxLineItemDto("Income Tax", new BigDecimal("24"), new BigDecimal("1200.00")))
        );
        when(taxService.calculateTax(any())).thenReturn(response);

        mockMvc.perform(post("/api/tax/calculate")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "incomeAmount": 5000,
                            "period": "monthly",
                            "country": "LT"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.grossIncome").value(5000.00))
                .andExpect(jsonPath("$.totalTax").value(1200.00));
    }

    @Test
    void calculate_returns400_whenInputIsInvalid() throws Exception {
        mockMvc.perform(post("/api/tax/calculate")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "incomeAmount": -100,
                            "period": "monthly",
                            "country": "LT"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }
}
