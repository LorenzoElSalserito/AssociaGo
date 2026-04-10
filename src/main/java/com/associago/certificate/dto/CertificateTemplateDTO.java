package com.associago.certificate.dto;

import java.time.LocalDateTime;

public record CertificateTemplateDTO(
        Long id,
        Long associationId,
        String name,
        String type,
        String bodyHtml,
        String mergeFields,
        String headerImagePath,
        String footerImagePath,
        String backgroundImagePath,
        String signatoryRoles,
        String orientation,
        String paperSize,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
