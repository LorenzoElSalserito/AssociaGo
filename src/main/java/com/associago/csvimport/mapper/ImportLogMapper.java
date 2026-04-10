package com.associago.csvimport.mapper;

import com.associago.csvimport.ImportLog;
import com.associago.csvimport.dto.ImportLogDTO;

public class ImportLogMapper {

    private ImportLogMapper() {}

    public static ImportLogDTO toDTO(ImportLog entity) {
        return new ImportLogDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getEntityType(),
                entity.getFileName(),
                entity.getFileChecksum(),
                entity.getTotalRows(),
                entity.getImportedRows(),
                entity.getSkippedRows(),
                entity.getErrorRows(),
                entity.getErrorsDetail(),
                entity.getImportedBy(),
                entity.getStatus(),
                entity.getStartedAt(),
                entity.getCompletedAt(),
                entity.getCreatedAt()
        );
    }
}
