package com.associago.signature;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionalSignatureRepository extends JpaRepository<InstitutionalSignature, Long> {

    List<InstitutionalSignature> findByAssociationId(Long associationId);

    List<InstitutionalSignature> findByAssociationIdAndActiveTrue(Long associationId);

    Optional<InstitutionalSignature> findByAssociationIdAndSignerRole(Long associationId, String signerRole);
}
