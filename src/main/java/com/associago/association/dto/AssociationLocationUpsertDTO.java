package com.associago.association.dto;

public record AssociationLocationUpsertDTO(
        String locationType,
        String name,
        String address,
        String city,
        String province,
        String postalCode,
        String country,
        String phone,
        String email,
        Boolean isPrimary,
        String notes
) {}
