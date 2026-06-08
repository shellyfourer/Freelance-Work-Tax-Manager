package com.shelly.freelancetaxmanager.config;

import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.service.UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class OAuth2UserServiceImpl implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final UserService userService;

    public OAuth2UserServiceImpl(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = new OidcUserService().loadUser(userRequest);
        userService.findOrCreateByGoogleId(oidcUser);
        return oidcUser;
    }
}