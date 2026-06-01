package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.enums.PaymentType;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeRecordRepository;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class IncomeRecordServiceImpl implements IncomeRecordService {

    private final IncomeRecordRepository incomeRecordRepository;
    private final IncomeSourceRepository incomeSourceRepository;
    private final UserRepository userRepository;

    public IncomeRecordServiceImpl(IncomeRecordRepository incomeRecordRepository, IncomeSourceRepository incomeSourceRepository, UserRepository userRepository) {
        this.incomeRecordRepository = incomeRecordRepository;
        this.incomeSourceRepository = incomeSourceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public IncomeRecord createIncomeRecord(IncomeRecord incomeRecord, Long incomeSourceId) {
        User defaultUser = userRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No default user found")); // way for us to unwrap the container since findFirst() returns optional

        IncomeSource source = incomeSourceRepository.findById(incomeSourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Income source not found with ID: " + incomeSourceId));

        validateHoursAndAmount(incomeRecord, source);
        incomeRecord.setUser(defaultUser);
        incomeRecord.setIncomeSource(source);

        return incomeRecordRepository.save(incomeRecord);
    }

    @Override
    public IncomeRecord updateIncomeRecord(IncomeRecord incomeRecord, Long incomeSourceId) {
        IncomeRecord income = incomeRecordRepository.findById(incomeRecord.getIncomeId())
                .orElseThrow(() -> new ResourceNotFoundException("Income record not found with ID: " + incomeRecord.getIncomeId()));

        IncomeSource source = incomeSourceRepository.findById(incomeSourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Income source not found with ID: " + incomeSourceId));

        validateHoursAndAmount(incomeRecord, source);
        income.setAmount(incomeRecord.getAmount());
        income.setIncomeDate(incomeRecord.getIncomeDate());
        income.setDescription(incomeRecord.getDescription());
        income.setHoursWorked(incomeRecord.getHoursWorked());
        income.setIncomeSource(source);

        return incomeRecordRepository.save(income);
    }

    @Override
    public void deleteIncomeRecord(Long id) {
        IncomeRecord income = incomeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income record not found with ID: " + id));

        incomeRecordRepository.delete(income);
    }

    @Override
    public IncomeRecord getIncomeRecordById(Long id) {
        return incomeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income record not found with ID: " + id));
    }

    @Override
    public List<IncomeRecord> getIncomeRecordsByUser(Long userId) {
        return incomeRecordRepository.findByUserUserId(userId);
    }

    private void validateHoursAndAmount(IncomeRecord record, IncomeSource source) {
        if (source.getPaymentType() == PaymentType.HOURLY) {
            if (record.getHoursWorked() == null || record.getHoursWorked().signum() <= 0) {
                throw new IllegalArgumentException("Hours worked is required for HOURLY income sources");
            }
            BigDecimal expected = record.getHoursWorked().multiply(source.getHourlyRate());
            BigDecimal diff = record.getAmount().subtract(expected).abs();
            if (diff.compareTo(new BigDecimal("0.01")) > 0) {
                throw new IllegalArgumentException("Amount does not match hours worked * hourly rate");
            }
        } else if (source.getPaymentType() == PaymentType.FIXED) {
            record.setHoursWorked(null);
        }
    }
}