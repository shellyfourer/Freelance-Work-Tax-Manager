package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;

import java.util.List;

public interface IncomeService {
    IncomeRecord createIncomeRecord(IncomeRecord incomeRecord);
    IncomeRecord updateIncomeRecord(IncomeRecord incomeRecord);
    IncomeRecord deleteIncomeRecord(Long id);
    IncomeRecord getIncomeRecordById(Long id);
    List<IncomeRecord> getIncomeRecordsByUser(Long userId);
}
