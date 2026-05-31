package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.entity.IncomeSource;

import java.util.List;

public interface IncomeSourceService {
    IncomeSource createIncomeSource(IncomeSource incomeSource);
    IncomeSource updateIncomeSource(IncomeSource incomeSource);
    void deleteIncomeSource(Long id);
    IncomeSource getIncomeSourceById(Long id);
    List<IncomeSource> getIncomeSourcesByUser(Long userId);
}
