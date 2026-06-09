package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.User;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

public interface UserService {
    User findOrCreateByGoogleId(OidcUser oidcUser);
    User findByGoogleId(String googleId);
}