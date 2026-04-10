package com.associago.csvimport.dto;

import java.time.LocalDateTime;

public record ImportLogDTO(
        Long id,
        Long associationId,
        String entityType,
        String fileName,
        String fileChecksum,
        Integer totalRows,
        Integer importedRows,
        Integer skippedRows,
        Integer errorRows,
        String errorsDetail,
        Long importedBy,
        String status,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        LocalDateTime createdAt
) {}
