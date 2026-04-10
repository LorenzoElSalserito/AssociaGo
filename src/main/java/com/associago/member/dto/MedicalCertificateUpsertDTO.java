package com.associago.member.dto;

import java.time.LocalDate;

public record MedicalCertificateUpsertDTO(
    Long memberId,
    Long associationId,
    String certificateType,
    LocalDate issueDate,
    LocalDate expiryDate,
    String issuedBy,
    String medicalFacility,
    String notes
) {}
