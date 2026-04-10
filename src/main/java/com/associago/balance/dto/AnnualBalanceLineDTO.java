package com.associago.balance.dto;

import java.math.BigDecimal;

public record AnnualBalanceLineDTO(
        Long id,
        Long balanceId,
        String section,
        Long categoryId,
        String label,
        BigDecimal amount,
        BigDecimal previousYearAmount,
        BigDecimal variance,
        BigDecimal variancePct,
        Integer sortOrder,
        boolean subtotal,
        String notes
) {}
