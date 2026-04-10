package com.associago.association.repository;

import com.associago.association.AssociationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssociationDocumentRepository extends JpaRepository<AssociationDocument, Long> {

    List<AssociationDocument> findByAssociationId(Long associationId);
}
