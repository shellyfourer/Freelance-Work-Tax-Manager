package com.shelly.freelancetaxmanager.config;

import com.shelly.freelancetaxmanager.service.OAuth2UserServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2UserServiceImpl oAuth2UserService;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public SecurityConfig(OAuth2UserServiceImpl oAuth2UserService, ClientRegistrationRepository clientRegistrationRepository) {
        this.oAuth2UserService = oAuth2UserService;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        try {
            http
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .csrf(csrf -> csrf
                            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                            .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                            .ignoringRequestMatchers("/ws/**", "/api/test/**")
                    )
                    .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/ws/**", "/api/test/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .oauth2Login(oauth2 -> oauth2
                            .userInfoEndpoint(userInfo -> userInfo.oidcUserService(oAuth2UserService))
                            .authorizationEndpoint(endpoint -> endpoint
                                    .authorizationRequestResolver(authorizationRequestResolver())
                            )
                            .defaultSuccessUrl(frontendUrl, true)
                    )
                    .logout(logout -> logout
                            .logoutSuccessUrl("/")
                            .permitAll()
                    )
                    .exceptionHandling(ex -> ex
                            .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                    );

            return http.build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to build security filter chain", e);
        }
    }

    private OAuth2AuthorizationRequestResolver authorizationRequestResolver() {
        DefaultOAuth2AuthorizationRequestResolver resolver = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository, "/oauth2/authorization"
        );
        resolver.setAuthorizationRequestCustomizer(customizer ->
                customizer.additionalParameters(params -> params.put("prompt", "select_account"))
        );
        return resolver;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://earnwise.duckdns.org:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}