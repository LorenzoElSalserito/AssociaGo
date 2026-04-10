package com.associago.member.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MedicalCertificateDTO(
    Long id,
    Long memberId,
    Long associationId,
    String certificateType,
    LocalDate issueDate,
    LocalDate expiryDate,
    String issuedBy,
    String medicalFacility,
    String filePath,
    String status,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
