package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.repository.IncomeRecordRepository;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeService {

    private final IncomeSourceRepository incomeSourceRepository;
    private final IncomeRecordRepository incomeRecordRepository;

    public IncomeService(
            IncomeSourceRepository incomeSourceRepository,
            IncomeRecordRepository incomeRecordRepository) {
        this.incomeSourceRepository = incomeSourceRepository;
        this.incomeRecordRepository = incomeRecordRepository;
    }

    public IncomeSource createIncomeSource(IncomeSource incomeSource) {
        return incomeSourceRepository.save(incomeSource);
    }

    public List<IncomeSource> getIncomeSourcesByUser(Long userId) {
        return incomeSourceRepository.findByUserUserId(userId);
    }

    public IncomeRecord createIncomeRecord(IncomeRecord incomeRecord) {
        return incomeRecordRepository.save(incomeRecord);
    }

    public List<IncomeRecord> getIncomeRecordsByUser(Long userId) {
        return incomeRecordRepository.findByUserUserId(userId);
    }
}