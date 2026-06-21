package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeRecordRepository;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class IncomeRecordServiceImpl implements IncomeRecordService {

    private static final Logger log = LoggerFactory.getLogger(IncomeRecordServiceImpl.class);
    private static final String INCOME_RECORD_NOT_FOUND = "Income record not found with ID: ";

    private final IncomeRecordRepository incomeRecordRepository;
    private final IncomeSourceRepository incomeSourceRepository;

    public IncomeRecordServiceImpl(IncomeRecordRepository incomeRecordRepository, IncomeSourceRepository incomeSourceRepository) {
        this.incomeRecordRepository = incomeRecordRepository;
        this.incomeSourceRepository = incomeSourceRepository;
    }

    @Override
    public IncomeRecord createIncomeRecord(IncomeRecord incomeRecord, Long incomeSourceId, User user) {
        IncomeSource source = getOwnedSource(incomeSourceId, user);
        validateHoursAndAmount(incomeRecord, source);
        incomeRecord.setUser(user);
        incomeRecord.setIncomeSource(source);
        IncomeRecord saved = incomeRecordRepository.save(incomeRecord);
        log.info("Income record created: id={}, user={}", saved.getIncomeId(), user.getEmail());
        return saved;
    }

    @Override
    public IncomeRecord updateIncomeRecord(IncomeRecord incomeRecord, Long incomeSourceId, User user) {
        IncomeRecord existing = getOwnedRecord(incomeRecord.getIncomeId(), user);
        IncomeSource source = getOwnedSource(incomeSourceId, user);
        validateHoursAndAmount(incomeRecord, source);
        existing.setAmount(incomeRecord.getAmount());
        existing.setIncomeDate(incomeRecord.getIncomeDate());
        existing.setDescription(incomeRecord.getDescription());
        existing.setHoursWorked(incomeRecord.getHoursWorked());
        existing.setIncomeSource(source);
        log.info("Income record updated: id={}, user={}", existing.getIncomeId(), user.getEmail());
        return incomeRecordRepository.save(existing);
    }

    @Override
    public void deleteIncomeRecord(Long id, User user) {
        IncomeRecord income = getOwnedRecord(id, user);
        incomeRecordRepository.delete(income);
        log.info("Income record deleted: id={}, user={}", id, user.getEmail());
    }

    @Override
    public IncomeRecord getIncomeRecordById(Long id, User user) {
        return getOwnedRecord(id, user);
    }

    @Override
    public List<IncomeRecord> getIncomeRecordsByUser(User user) {
        return incomeRecordRepository.findByUserUserId(user.getUserId());
    }

    private IncomeRecord getOwnedRecord(Long id, User user) {
        IncomeRecord income = incomeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_RECORD_NOT_FOUND + id));
        if (!income.getUser().getUserId().equals(user.getUserId())) {
            log.warn("Access violation: user {} attempted to access income record {}", user.getEmail(), id);
            throw new ResourceNotFoundException(INCOME_RECORD_NOT_FOUND + id);
        }
        return income;
    }

    private IncomeSource getOwnedSource(Long id, User user) {
        IncomeSource source = incomeSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income source not found with ID: " + id));
        if (!source.getUser().getUserId().equals(user.getUserId())) {
            log.warn("Access violation: user {} attempted to access income source {}", user.getEmail(), id);
            throw new ResourceNotFoundException("Income source not found with ID: " + id);
        }
        return source;
    }

    private void validateHoursAndAmount(IncomeRecord incomeEntry, IncomeSource source) {
        if (source.getPaymentType() == PaymentType.HOURLY) {
            if (incomeEntry.getHoursWorked() == null || incomeEntry.getHoursWorked().signum() <= 0) {
                throw new IllegalArgumentException("Hours worked is required for HOURLY income sources");
            }
            BigDecimal expected = incomeEntry.getHoursWorked().multiply(source.getHourlyRate());
            BigDecimal diff = incomeEntry.getAmount().subtract(expected).abs();
            if (diff.compareTo(new BigDecimal("0.01")) > 0) {
                throw new IllegalArgumentException("Amount does not match hours worked * hourly rate");
            }
        } else if (source.getPaymentType() == PaymentType.FIXED) {
            incomeEntry.setHoursWorked(null);
        }
    }
}