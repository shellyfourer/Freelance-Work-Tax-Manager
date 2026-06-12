package com.shelly.freelancetaxmanager.mapper;

import com.shelly.freelancetaxmanager.dto.UserResponseDto;
import com.shelly.freelancetaxmanager.entity.User;

public class UserMapper {

    private UserMapper() {}

    public static UserResponseDto toDto(User entity) {
        return new UserResponseDto(
                entity.getUserId(),
                entity.getName(),
                entity.getEmail(),
                entity.getCountry() != null ? entity.getCountry() : "",
                entity.getCurrency() != null ? entity.getCurrency() : "",
                entity.getCountry() != null && entity.getCurrency() != null
        );
    }
}