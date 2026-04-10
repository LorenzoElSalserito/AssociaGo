package com.associago.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record MemberUpdateDTO(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email String email,
        String phone,
        String address,
        String fiscalCode,
        LocalDate birthDate,
        String memberType,
        String memberCategory
) {}
