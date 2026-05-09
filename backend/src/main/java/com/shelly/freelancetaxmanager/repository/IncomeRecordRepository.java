package com.shelly.freelancetaxmanager.repository;

import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeRecordRepository extends JpaRepository<IncomeRecord, Long> {

    List<IncomeRecord> findByUserUserId(Long userId);
}