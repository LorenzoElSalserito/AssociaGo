package com.associago.budget.dto;

import java.time.LocalDateTime;

public record BudgetDTO(
        Long id,
        Long associationId,
        Integer year,
        String name,
        String title,
        String status,
        Long approvedBy,
        LocalDateTime approvedAt,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
