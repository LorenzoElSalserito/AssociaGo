package com.associago.certificate;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssuedCertificateRepository extends JpaRepository<IssuedCertificate, Long> {
    List<IssuedCertificate> findByAssociationId(Long associationId);
    List<IssuedCertificate> findByActivityId(Long activityId);
    List<IssuedCertificate> findByEventId(Long eventId);
    List<IssuedCertificate> findByUserId(Long userId);
    long countByAssociationId(Long associationId);
}
