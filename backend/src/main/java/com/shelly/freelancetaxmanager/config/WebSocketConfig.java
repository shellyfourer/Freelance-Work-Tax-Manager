package com.shelly.freelancetaxmanager.config;

import com.shelly.freelancetaxmanager.websocket.TaxCalculationHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

//this tells spring where to send income websocket connections
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final TaxCalculationHandler taxCalculationHandler;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public WebSocketConfig(TaxCalculationHandler taxCalculationHandler) {
        this.taxCalculationHandler = taxCalculationHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(taxCalculationHandler, "/ws/tax-calculator")
                .setAllowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001",
                        frontendUrl
                );
    }
}
