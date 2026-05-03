package com.shelly.freelancetaxmanager.repository;

import com.shelly.freelancetaxmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}