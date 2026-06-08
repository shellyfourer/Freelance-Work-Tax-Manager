package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeSourceServiceImpl implements IncomeSourceService {

    private static final String INCOME_SOURCE_NOT_FOUND = "Income source not found with ID: ";

    private final IncomeSourceRepository incomeSourceRepository;
    private final UserRepository userRepository;

    public IncomeSourceServiceImpl(IncomeSourceRepository incomeSourceRepository, UserRepository userRepository) {
        this.incomeSourceRepository = incomeSourceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public IncomeSource createIncomeSource(IncomeSource incomeSource) {

        User defaultUser = userRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No default user found")); // way for us to unwrap the container since findFirst() returns optional

        validatePaymentType(incomeSource);
        incomeSource.setUser(defaultUser);

        return incomeSourceRepository.save(incomeSource);
    }

    @Override
    public IncomeSource updateIncomeSource(IncomeSource incomeSource) {
        IncomeSource source = incomeSourceRepository.findById(incomeSource.getSourceId())
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_SOURCE_NOT_FOUND + incomeSource.getSourceId()));

        source.setName(incomeSource.getName());
        source.setDescription(incomeSource.getDescription());
        source.setPaymentType(incomeSource.getPaymentType());
        source.setHourlyRate(incomeSource.getHourlyRate());
        validatePaymentType(source);

        return incomeSourceRepository.save(source);
    }

    @Override
    public void deleteIncomeSource(Long id) {
        IncomeSource source = incomeSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_SOURCE_NOT_FOUND + id));

        incomeSourceRepository.delete(source);
    }

    @Override
    public IncomeSource getIncomeSourceById(Long id) {
        return incomeSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_SOURCE_NOT_FOUND + id));
    }

    @Override
    public List<IncomeSource> getIncomeSourcesByUser(Long userId) {
        return incomeSourceRepository.findByUserUserId(userId);
    }

    private void validatePaymentType(IncomeSource source) {
        if (source.getPaymentType() == PaymentType.HOURLY) {
            if (source.getHourlyRate() == null || source.getHourlyRate().signum() <= 0) {
                throw new IllegalArgumentException("Hourly rate is required for HOURLY payment type");
            }
        } else if (source.getPaymentType() == PaymentType.FIXED) {
            source.setHourlyRate(null);
        }
    }
}

