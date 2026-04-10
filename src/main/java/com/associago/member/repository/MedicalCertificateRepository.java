package com.associago.member.repository;

import com.associago.member.MedicalCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalCertificateRepository extends JpaRepository<MedicalCertificate, Long> {

    Optional<MedicalCertificate> findByMemberIdAndAssociationId(Long memberId, Long associationId);

    List<MedicalCertificate> findByAssociationId(Long associationId);

    List<MedicalCertificate> findByAssociationIdAndStatus(Long associationId, String status);

    List<MedicalCertificate> findByAssociationIdAndExpiryDateBefore(Long associationId, LocalDate date);

    List<MedicalCertificate> findByAssociationIdAndExpiryDateBetween(Long associationId, LocalDate from, LocalDate to);
}
