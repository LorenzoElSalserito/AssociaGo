package com.associago.activity.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ActivityCreateDTO(
        Long associationId,
        @NotBlank String name,
        String description,
        String category,
        LocalDate startDate,
        LocalDate endDate,
        LocalTime startTime,
        LocalTime endTime,
        String location,
        Integer maxParticipants,
        BigDecimal cost,
        boolean isActive,
        String subscriptionType,
        String scheduleDetails,
        boolean requireRegistration,
        boolean generateInvoice,
        String imagePath,
        String documentPath
) {}
