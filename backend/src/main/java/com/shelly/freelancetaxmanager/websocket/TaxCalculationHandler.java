package com.shelly.freelancetaxmanager.websocket;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.shelly.freelancetaxmanager.dto.TaxCalculationRequestDto;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;
import com.shelly.freelancetaxmanager.service.TaxService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.math.BigDecimal;

@Component
public class TaxCalculationHandler extends TextWebSocketHandler {

    private final TaxService taxService;
    private final ObjectMapper objectMapper;

    public TaxCalculationHandler(TaxService taxService, ObjectMapper objectMapper) {
        this.taxService = taxService;
        this.objectMapper = objectMapper;
    }

    @Override
    //session, one per each user, is passed in automatically by Spring
    //message is the raw text that arrived from the client
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode node = objectMapper.readTree(message.getPayload());
            BigDecimal incomeAmount = new BigDecimal(node.get("incomeAmount").asText());
            String period = node.get("period").asText();
            String country = node.get("country").asText();

            //reuses all the existing logic from the service layer, so we don't have to duplicate it here
            TaxCalculationRequestDto request = new TaxCalculationRequestDto(incomeAmount, period, country);
            TaxCalculationResponseDto response = taxService.calculateTax(request);

            //we use session to send the JSON response back to the exact same client that made the request,
            // and we use ObjectMapper to convert the response DTO to JSON string
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
            //we don't need to close the session here, because the session is closed automatically when the client disconnects
            //we send an error message if the calculation fails, instead of crashing the connection
        } catch (Exception e) {
            session.sendMessage(new TextMessage("{\"error\": \"Calculation failed\"}"));
        }
    }
}
