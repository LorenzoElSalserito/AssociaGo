package com.associago.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionCreateDTO(
        Long associationId,
        LocalDate date,
        BigDecimal amount,
        String type,
        String category,
        String description,
        String paymentMethod,
        String referenceId,
        Long userId,
        Long eventId,
        Long activityId,
        Long membershipId,
        Long projectId,
        Long fundId,
        String costCenter
) {}
