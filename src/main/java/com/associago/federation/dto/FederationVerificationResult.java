package com.associago.federation.dto;

import java.time.LocalDate;

public record FederationVerificationResult(
    boolean valid,
    String certificateNumber,
    String holderName,
    String associationName,
    LocalDate issueDate,
    String status,
    String providerCode,
    String message
) {}
