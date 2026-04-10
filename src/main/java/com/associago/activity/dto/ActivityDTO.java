package com.associago.activity.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ActivityDTO(
        Long id,
        Long associationId,
        String name,
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
        String documentPath,
        LocalDate cancellationDate,
        String cancellationReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
