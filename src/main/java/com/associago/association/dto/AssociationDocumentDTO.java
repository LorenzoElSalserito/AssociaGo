package com.associago.association.dto;

import java.time.LocalDateTime;

public record AssociationDocumentDTO(
        Long id,
        Long associationId,
        String documentType,
        String title,
        String filePath,
        Long fileSize,
        String mimeType,
        Integer version,
        Long uploadedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
