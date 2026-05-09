package com.shelly.freelancetaxmanager.repository;

import com.shelly.freelancetaxmanager.entity.IncomeSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeSourceRepository extends JpaRepository<IncomeSource, Long> {

    List<IncomeSource> findByUserUserId(Long userId);
}