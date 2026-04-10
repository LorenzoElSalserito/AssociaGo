package com.associago.certificate.mapper;

import com.associago.certificate.CertificateTemplate;
import com.associago.certificate.IssuedCertificate;
import com.associago.certificate.dto.CertificateTemplateDTO;
import com.associago.certificate.dto.CertificateTemplateUpsertDTO;
import com.associago.certificate.dto.IssuedCertificateDTO;

public class CertificateMapper {

    private CertificateMapper() {}

    public static CertificateTemplateDTO toDTO(CertificateTemplate entity) {
        return new CertificateTemplateDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getName(),
                entity.getType(),
                entity.getBodyHtml(),
                entity.getMergeFields(),
                entity.getHeaderImagePath(),
                entity.getFooterImagePath(),
                entity.getBackgroundImagePath(),
                entity.getSignatoryRoles(),
                entity.getOrientation(),
                entity.getPaperSize(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static CertificateTemplate toEntity(CertificateTemplateUpsertDTO dto) {
        CertificateTemplate entity = new CertificateTemplate();
        updateEntity(entity, dto);
        return entity;
    }

    public static void updateEntity(CertificateTemplate entity, CertificateTemplateUpsertDTO dto) {
        if (dto.associationId() != null) entity.setAssociationId(dto.associationId());
        if (dto.name() != null) entity.setName(dto.name());
        if (dto.type() != null) entity.setType(dto.type());
        if (dto.bodyHtml() != null) entity.setBodyHtml(dto.bodyHtml());
        if (dto.mergeFields() != null) entity.setMergeFields(dto.mergeFields());
        if (dto.headerImagePath() != null) entity.setHeaderImagePath(dto.headerImagePath());
        if (dto.footerImagePath() != null) entity.setFooterImagePath(dto.footerImagePath());
        if (dto.backgroundImagePath() != null) entity.setBackgroundImagePath(dto.backgroundImagePath());
        if (dto.signatoryRoles() != null) entity.setSignatoryRoles(dto.signatoryRoles());
        if (dto.orientation() != null) entity.setOrientation(dto.orientation());
        if (dto.paperSize() != null) entity.setPaperSize(dto.paperSize());
        if (dto.active() != null) entity.setActive(dto.active());
    }

    public static IssuedCertificateDTO toDTO(IssuedCertificate entity) {
        return new IssuedCertificateDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getTemplateId(),
                entity.getUserId(),
                entity.getEventId(),
                entity.getActivityId(),
                entity.getCertificateNumber(),
                entity.getIssueDate(),
                entity.getIssuedBy(),
                entity.getTitle(),
                entity.getBodySnapshot(),
                entity.getSignatories(),
                entity.getPdfPath(),
                entity.getChecksum(),
                entity.getQrCodeData(),
                entity.getStatus(),
                entity.getRevokedAt(),
                entity.getRevokedReason(),
                entity.getCreatedAt()
        );
    }
}
