package com.associago.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BudgetLineDTO(
        Long id,
        Long budgetId,
        Long categoryId,
        String label,
        String category,
        String type,
        String section,
        BigDecimal budgetedAmount,
        BigDecimal actualAmount,
        BigDecimal forecastAmount,
        Integer sortOrder,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
