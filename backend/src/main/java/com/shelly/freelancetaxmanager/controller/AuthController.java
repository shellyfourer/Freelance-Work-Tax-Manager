package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.dto.UserResponseDto;
import com.shelly.freelancetaxmanager.dto.UserSetupRequestDto;
import com.shelly.freelancetaxmanager.mapper.UserMapper;
import com.shelly.freelancetaxmanager.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal OidcUser oidcUser) {
        UserResponseDto dto = UserMapper.toDto(userService.findByGoogleId(oidcUser.getSubject()));
        log.info("User profile fetched: {}", dto.email());
        return ResponseEntity.ok(dto);
    }
}