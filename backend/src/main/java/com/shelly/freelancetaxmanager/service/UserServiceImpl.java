package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User findOrCreateByGoogleId(OidcUser oidcUser) { 
        String googleId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        return userRepository.findByGoogleId(googleId).orElseGet(() ->
            userRepository.findByEmail(email).map(existing -> {
                existing.setGoogleId(googleId);
                log.info("Linked Google ID to existing user: {}", email);
                return userRepository.save(existing);
            }).orElseGet(() -> {
                User newUser = new User();
                newUser.setGoogleId(googleId);
                newUser.setEmail(email);
                newUser.setName(name);
                log.info("Created new user from Google login: {}", email);
                return userRepository.save(newUser);
            })
        );
    }

    @Override
    public User findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public void setup(String googleId, String country, String currency) {
        User user = findByGoogleId(googleId);
        user.setCountry(country);
        user.setCurrency(currency);
        userRepository.save(user);
        log.info("User setup complete: {}", user.getEmail());
    }
}
