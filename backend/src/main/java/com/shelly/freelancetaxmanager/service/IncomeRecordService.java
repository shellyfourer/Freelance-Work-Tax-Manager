package com.shelly.freelancetaxmanager.service;
import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.User;

import java.util.List;

public interface IncomeRecordService {
    IncomeRecord createIncomeRecord(IncomeRecord incomeRecord, Long incomeSourceId, User user);
    IncomeRecord updateIncomeRecord(IncomeRecord incomeRecord, Long incomeSourceId, User user);
    void deleteIncomeRecord(Long id, User user);
    IncomeRecord getIncomeRecordById(Long id, User user);
    List<IncomeRecord> getIncomeRecordsByUser(User user);
}
