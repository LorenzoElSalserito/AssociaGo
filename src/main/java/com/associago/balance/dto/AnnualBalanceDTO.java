package com.associago.balance.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AnnualBalanceDTO(
        Long id,
        Long associationId,
        Integer year,
        String title,
        String status,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal netResult,
        BigDecimal openingFund,
        BigDecimal closingFund,
        LocalDateTime computedAt,
        Long approvedBy,
        LocalDateTime approvedAt,
        String signatories,
        String pdfPath,
        String checksum,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
