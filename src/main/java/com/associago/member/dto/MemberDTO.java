package com.associago.member.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MemberDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        String fiscalCode,
        LocalDate birthDate,
        String membershipStatus,
        String memberType,
        Integer completenessScore,
        String memberCategory,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
