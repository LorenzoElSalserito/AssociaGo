package com.associago.certificate;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, Long> {
    List<CertificateTemplate> findByAssociationIdAndActiveTrue(Long associationId);
    List<CertificateTemplate> findByAssociationId(Long associationId);
    List<CertificateTemplate> findByAssociationIdAndType(Long associationId, String type);
}
