package com.associago.association.dto;

import java.time.LocalDate;

public record AssociationDeadlineUpsertDTO(
        String title,
        String description,
        LocalDate dueDate,
        String category,
        String status,
        Integer reminderDays,
        Boolean recurring,
        Integer recurringMonths
) {}
