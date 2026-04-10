package com.associago.association.dto;

import java.time.LocalDateTime;

public record AssociationLocationDTO(
        Long id,
        Long associationId,
        String locationType,
        String name,
        String address,
        String city,
        String province,
        String postalCode,
        String country,
        String phone,
        String email,
        boolean isPrimary,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
