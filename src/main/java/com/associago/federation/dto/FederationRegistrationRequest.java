package com.associago.federation.dto;

public record FederationRegistrationRequest(
    Long associationId,
    String associationName,
    String fiscalCode,
    String type,       // ASD
    String address,
    String email,
    String presidentName
) {}
