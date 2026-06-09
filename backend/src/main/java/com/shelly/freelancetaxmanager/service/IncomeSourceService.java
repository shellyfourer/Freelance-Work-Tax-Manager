package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;

import java.util.List;

public interface IncomeSourceService {
    IncomeSource createIncomeSource(IncomeSource incomeSource, User user);
    IncomeSource updateIncomeSource(IncomeSource incomeSource, User user);
    void deleteIncomeSource(Long id, User user);
    IncomeSource getIncomeSourceById(Long id, User user);
    List<IncomeSource> getIncomeSourcesByUser(User user);
}