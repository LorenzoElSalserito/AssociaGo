package com.associago.event.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventCreateDTO(
        Long associationId,
        @NotBlank String name,
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
        boolean generateInvoice
) {}
