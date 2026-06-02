package com.shelly.freelancetaxmanager.config;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import com.shelly.freelancetaxmanager.repository.UserRepository;

import java.math.BigDecimal;
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
            defaultUser.setName("Default User");
            defaultUser.setEmail("default@freelancetaxmanager.com");
            defaultUser.setCountry("LT");
            defaultUser.setCurrency("EUR");
            userRepository.save(defaultUser);

            IncomeSource hourlySource = new IncomeSource();
            hourlySource.setUser(defaultUser);
            hourlySource.setName("Acme Corp");
            hourlySource.setDescription("Hourly consulting work");
            hourlySource.setPaymentType(PaymentType.HOURLY);
            hourlySource.setHourlyRate(new BigDecimal("75.00"));
            incomeSourceRepository.save(hourlySource);

            IncomeSource fixedSource = new IncomeSource();
            fixedSource.setUser(defaultUser);
            fixedSource.setName("Globex Project");
            fixedSource.setDescription("Fixed-price project delivery");
            fixedSource.setPaymentType(PaymentType.FIXED);
            incomeSourceRepository.save(fixedSource);
        }
    }
}