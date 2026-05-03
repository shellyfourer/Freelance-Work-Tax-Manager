package com.shelly.freelancetaxmanager.config;

import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            User defaultUser = new User();
            defaultUser.setFullName("Default User");
            defaultUser.setEmail("default@freelancetaxmanager.com");
            defaultUser.setCountry("LT");
            userRepository.save(defaultUser);
        }
    }
}