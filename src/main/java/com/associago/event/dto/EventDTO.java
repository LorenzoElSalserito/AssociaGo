package com.associago.event.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventDTO(
        Long id,
        Long associationId,
        String name,
        String description,
        String type,
        LocalDateTime startDatetime,
        LocalDateTime endDatetime,
        String location,
        String address,
        Integer maxParticipants,
        BigDecimal costMember,
        BigDecimal costNonMember,
        Boolean isPublic,
        String status,
        boolean requireRegistration,
        boolean generateInvoice,
        LocalDateTime cancellationDate,
        String cancellationReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
