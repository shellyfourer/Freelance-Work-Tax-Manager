package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.dto.UserSetupRequestDto;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/setup")
    public ResponseEntity<Void> setup(
            @AuthenticationPrincipal OidcUser oidcUser,
            @Valid @RequestBody UserSetupRequestDto dto
    ) {
        userService.setup(oidcUser.getSubject(), dto.country(), dto.currency());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal OidcUser oidcUser) {
        User user = userService.findByGoogleId(oidcUser.getSubject());
        boolean setupComplete = user.getCountry() != null && user.getCurrency() != null;
        log.info("User profile fetched: {}", user.getEmail());
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "country", user.getCountry() != null ? user.getCountry() : "",
                "currency", user.getCurrency() != null ? user.getCurrency() : "",
                "setupComplete", setupComplete
        ));
    }
}