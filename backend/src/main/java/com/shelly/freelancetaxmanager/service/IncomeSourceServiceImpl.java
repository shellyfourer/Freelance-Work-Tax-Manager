package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeSourceServiceImpl implements IncomeSourceService {

    private static final Logger log = LoggerFactory.getLogger(IncomeSourceServiceImpl.class);
    private static final String INCOME_SOURCE_NOT_FOUND = "Income source not found with ID: ";

    private final IncomeSourceRepository incomeSourceRepository;

    public IncomeSourceServiceImpl(IncomeSourceRepository incomeSourceRepository) {
        this.incomeSourceRepository = incomeSourceRepository;
    }

    @Override
    public IncomeSource createIncomeSource(IncomeSource incomeSource, User user) {
        validatePaymentType(incomeSource);
        incomeSource.setUser(user);
        IncomeSource saved = incomeSourceRepository.save(incomeSource);
        log.info("Income source created: id={}, user={}", saved.getSourceId(), user.getEmail());
        return saved;
    }

    @Override
    public IncomeSource updateIncomeSource(IncomeSource incomeSource, User user) {
        IncomeSource source = getOwnedSource(incomeSource.getSourceId(), user);
        source.setName(incomeSource.getName());
        source.setDescription(incomeSource.getDescription());
        source.setPaymentType(incomeSource.getPaymentType());
        source.setHourlyRate(incomeSource.getHourlyRate());
        validatePaymentType(source);
        log.info("Income source updated: id={}, user={}", source.getSourceId(), user.getEmail());
        return incomeSourceRepository.save(source);
    }

    @Override
    public void deleteIncomeSource(Long id, User user) {
        IncomeSource source = getOwnedSource(id, user);
        incomeSourceRepository.delete(source);
        log.info("Income source deleted: id={}, user={}", id, user.getEmail());
    }

    @Override
    public IncomeSource getIncomeSourceById(Long id, User user) {
        return getOwnedSource(id, user);
    }

    @Override
    public List<IncomeSource> getIncomeSourcesByUser(User user) {
        return incomeSourceRepository.findByUserUserId(user.getUserId());
    }

    private IncomeSource getOwnedSource(Long id, User user) {
        IncomeSource source = incomeSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_SOURCE_NOT_FOUND + id));
        if (!source.getUser().getUserId().equals(user.getUserId())) {
            log.warn("Access violation: user {} attempted to access income source {}", user.getEmail(), id);
            throw new ResourceNotFoundException(INCOME_SOURCE_NOT_FOUND + id);
        }
        return source;
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