package com.associago.volunteer.dto;

import jakarta.validation.constraints.NotNull;

public record VolunteerCreateDTO(
        @NotNull Long memberId,
        String skills,
        String availability,
        String status,
        String notes
) {}
