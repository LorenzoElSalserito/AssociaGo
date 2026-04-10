package com.associago.certificate.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record IssuedCertificateDTO(
        Long id,
        Long associationId,
        Long templateId,
        Long userId,
        Long eventId,
        Long activityId,
        String certificateNumber,
        LocalDate issueDate,
        Long issuedBy,
        String title,
        String bodySnapshot,
        String signatories,
        String pdfPath,
        String checksum,
        String qrCodeData,
        String status,
        LocalDateTime revokedAt,
        String revokedReason,
        LocalDateTime createdAt
) {}
