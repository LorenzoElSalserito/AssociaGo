package com.associago.federation.dto;

public record FederationRegistrationResult(
    boolean success,
    String registrationNumber,
    String message,
    String providerCode
) {}
