package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.exception.ResourceNotFoundException;
import com.shelly.freelancetaxmanager.repository.IncomeRecordRepository;
import com.shelly.freelancetaxmanager.repository.UserRepository;
import com.shelly.freelancetaxmanager.repository.IncomeSourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRecordRepository incomeRecordRepository;
    private final IncomeSourceRepository incomeSourceRepository;
    private final UserRepository userRepository;

    public IncomeServiceImpl(IncomeRecordRepository incomeRecordRepository, IncomeSourceRepository incomeSourceRepository, UserRepository userRepository) {
        this.incomeRecordRepository = incomeRecordRepository;
        this.incomeSourceRepository = incomeSourceRepository;
        this.userRepository = userRepository;
    }


    @Override
    public IncomeRecord createIncomeRecord(IncomeRecord incomeRecord) {
        User defaultUser = userRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No default user found")); // way for us to unwrap the container since findFirst() returns optional

        IncomeSource defaultSource = incomeSourceRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No default income source found"));

        incomeRecord.setUser(defaultUser);
        incomeRecord.setIncomeSource(defaultSource);

        return incomeRecordRepository.save(incomeRecord);
    }

    @Override
    public IncomeRecord updateIncomeRecord(IncomeRecord incomeRecord) {
        IncomeRecord income = incomeRecordRepository.findById(incomeRecord.getIncomeId())
                .orElseThrow(() -> new ResourceNotFoundException("Income record not found with ID: " + incomeRecord.getIncomeId()));

        income.setAmount(incomeRecord.getAmount());
        income.setIncomeDate(incomeRecord.getIncomeDate());
        income.setDescription(incomeRecord.getDescription());

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
}