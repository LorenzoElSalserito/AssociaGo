package com.associago.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionDTO(
        Long id,
        Long associationId,
        LocalDate date,
        BigDecimal amount,
        String type,
        Long categoryId,
        String category,
        String description,
        String paymentMethod,
        String referenceId,
        Long userId,
        Long eventId,
        Long activityId,
        Long projectId,
        Long fundId,
        String costCenter,
        Long membershipId,
        Long inventoryItemId,
        String receiptPath,
        boolean isVerified,
        Long verifiedById,
        LocalDateTime verifiedAt,
        boolean isRenewal,
        Integer renewalYear,
        String quotaPeriod,
        BigDecimal commissionAmount,
        BigDecimal netAmount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long createdBy
) {}
