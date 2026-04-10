package com.associago.association.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AssociationDTO(
        Long id,
        String name,
        String slug,
        String email,
        String taxCode,
        String vatNumber,
        String type,
        String address,
        String city,
        String province,
        String zipCode,
        String phone,
        String description,
        String president,
        String vicePresident,
        String secretary,
        String treasurer,
        String statutePath,
        String regulationPath,
        String secondaryLogoPath,
        String partnerLogoPath,
        LocalDate foundationDate,
        boolean isActive,
        String membershipNumberFormat,
        Double baseMembershipFee,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
