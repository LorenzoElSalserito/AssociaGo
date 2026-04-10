package com.associago.association.repository;

import com.associago.association.AssociationDeadline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssociationDeadlineRepository extends JpaRepository<AssociationDeadline, Long> {

    List<AssociationDeadline> findByAssociationId(Long associationId);

    List<AssociationDeadline> findByAssociationIdAndStatus(Long associationId, String status);
}
