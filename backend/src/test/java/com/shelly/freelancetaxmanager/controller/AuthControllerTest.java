package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.config.SecurityConfig;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.service.OAuth2UserServiceImpl;
import com.shelly.freelancetaxmanager.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = AuthController.class, excludeAutoConfiguration = OAuth2ClientWebSecurityAutoConfiguration.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private OAuth2UserServiceImpl oAuth2UserService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setName("Shelly Fourer");
        user.setEmail("shelly@test.com");
        user.setCountry("LT");
        user.setCurrency("EUR");

        when(userService.findByGoogleId(any())).thenReturn(user);
    }

    @Test
    void getMe_returns200_withUserProfile() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .with(oidcLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Shelly Fourer"))
                .andExpect(jsonPath("$.email").value("shelly@test.com"))
                .andExpect(jsonPath("$.country").value("LT"))
                .andExpect(jsonPath("$.currency").value("EUR"))
                .andExpect(jsonPath("$.setupComplete").value(true));
    }

    @Test
    void getMe_returns200_withSetupCompleteFalse_whenCountryIsNull() throws Exception {
        user.setCountry(null);
        user.setCurrency(null);

        mockMvc.perform(get("/api/auth/me")
                .with(oidcLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.setupComplete").value(false));
    }

    @Test
    void getMe_returns401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void setup_returns200_withValidInput() throws Exception {
        doNothing().when(userService).setup(any(), any(), any());

        mockMvc.perform(post("/api/auth/setup")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "country": "LT",
                            "currency": "EUR"
                        }
                        """))
                .andExpect(status().isOk());
    }

    @Test
    void setup_returns400_whenCountryIsBlank() throws Exception {
        mockMvc.perform(post("/api/auth/setup")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "country": "",
                            "currency": "EUR"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void setup_returns400_whenCurrencyIsBlank() throws Exception {
        mockMvc.perform(post("/api/auth/setup")
                .with(oidcLogin()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "country": "LT",
                            "currency": ""
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void setup_returns401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(post("/api/auth/setup")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "country": "LT",
                            "currency": "EUR"
                        }
                        """))
                .andExpect(status().isUnauthorized());
    }
}