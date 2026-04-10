package com.associago.budget.dto;

public record BudgetUpsertDTO(
        Long associationId,
        Integer year,
        String name,
        String title,
        String notes
) {}
