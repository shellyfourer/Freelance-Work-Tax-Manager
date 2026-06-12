package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Profile("dev")
@RestController
@RequestMapping("/api/test")
public class TestAuthController {

    private static final String TEST_GOOGLE_ID = "test-google-id-e2e";
    private final UserService userService;

    public TestAuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Void> testLogin(HttpServletRequest request) {
        // 1. Fake Google ID token
        var idToken = new OidcIdToken("test-token", Instant.now(), Instant.now().plusSeconds(3600),
                Map.of("sub", TEST_GOOGLE_ID, "iss", "https://accounts.google.com"));

        // 2. Fake Google user
        OidcUser oidcUser = new DefaultOidcUser(
                List.of(new SimpleGrantedAuthority("ROLE_USER")), idToken,
                new OidcUserInfo(Map.of("sub", TEST_GOOGLE_ID, "name", "E2E Test User", "email", "e2e@test.com")));

        // 3. Save user to DB and mark setup complete
        userService.findOrCreateByGoogleId(oidcUser);
        userService.setup(TEST_GOOGLE_ID, "LT", "EUR");

        // 4. Put user in session (same as Spring would after a real OAuth callback)
        var ctx = SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(new OAuth2AuthenticationToken(oidcUser, oidcUser.getAuthorities(), "google"));
        SecurityContextHolder.setContext(ctx);
        request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, ctx);

        return ResponseEntity.ok().build();
    }
}
