package com.associago.budget.dto;

import java.math.BigDecimal;

public record BudgetLineUpsertDTO(
        Long categoryId,
        String label,
        String category,
        String type,
        String section,
        BigDecimal budgetedAmount,
        BigDecimal forecastAmount,
        Integer sortOrder,
        String notes
) {}
