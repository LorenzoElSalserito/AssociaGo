package com.associago.association.mapper;

import com.associago.association.AssociationDocument;
import com.associago.association.dto.AssociationDocumentDTO;

public class AssociationDocumentMapper {

    private AssociationDocumentMapper() {}

    public static AssociationDocumentDTO toDTO(AssociationDocument entity) {
        return new AssociationDocumentDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getDocumentType(),
                entity.getTitle(),
                entity.getFilePath(),
                entity.getFileSize(),
                entity.getMimeType(),
                entity.getVersion(),
                entity.getUploadedBy(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
