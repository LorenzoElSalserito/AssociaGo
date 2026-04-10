package com.associago.association.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AssociationCreateDTO(
        @NotBlank String name,
        String slug,
        @NotBlank @Email String email,
        String password,
        String taxCode,
        String type
) {}
