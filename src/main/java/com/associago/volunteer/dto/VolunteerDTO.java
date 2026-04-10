package com.associago.volunteer.dto;

import java.time.LocalDateTime;

public record VolunteerDTO(
        Long id,
        Long memberId,
        String skills,
        String availability,
        String status,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
