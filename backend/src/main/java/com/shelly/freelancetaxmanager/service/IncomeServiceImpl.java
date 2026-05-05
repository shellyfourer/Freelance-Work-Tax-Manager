package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.repository.IncomeRecordRepository;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRecordRepository incomeRecordRepository;
    private final IncomeSourceRepository incomeSourceRepository;

    public IncomeServiceImpl(IncomeRecordRepository incomeRecordRepository, IncomeSourceRepository incomeSourceRepository) {
        this.incomeRecordRepository = incomeRecordRepository;
        this.incomeSourceRepository = incomeSourceRepository;
    }


    @Override
    public IncomeRecord createIncomeRecord(IncomeRecord incomeRecord) {
        return null;
    }

    @Override
    public IncomeRecord updateIncomeRecord(IncomeRecord incomeRecord) {
        return null;
    }

    @Override
    public IncomeRecord deleteIncomeRecord(Long id) {
        return null;
    }

    @Override
    public IncomeRecord getIncomeRecordById(Long id) {
        return null;
    }

    @Override
    public List<IncomeRecord> getIncomeRecordsByUser(Long userId) {
        return List.of();
    }
}