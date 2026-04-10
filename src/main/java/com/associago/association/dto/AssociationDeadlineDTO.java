package com.associago.association.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AssociationDeadlineDTO(
        Long id,
        Long associationId,
        String title,
        String description,
        LocalDate dueDate,
        String category,
        String status,
        LocalDateTime completedAt,
        Long completedBy,
        Integer reminderDays,
        boolean recurring,
        Integer recurringMonths,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
