package com.shelly.freelancetaxmanager.config;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final IncomeSourceRepository incomeSourceRepository;

    public DataInitializer(UserRepository userRepository, IncomeSourceRepository incomeSourceRepository) {
        this.userRepository = userRepository;
        this.incomeSourceRepository = incomeSourceRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            User defaultUser = new User();
            defaultUser.setFullName("Default User");
            defaultUser.setEmail("default@freelancetaxmanager.com");
            defaultUser.setCountry("LT");
            userRepository.save(defaultUser);

            IncomeSource defaultIncomeSource = new IncomeSource();
            defaultIncomeSource.setUser(defaultUser);
            defaultIncomeSource.setName("Default Income Source");
            defaultIncomeSource.setDescription("Automatically created default income source");
            incomeSourceRepository.save(defaultIncomeSource);
        }
    }
}