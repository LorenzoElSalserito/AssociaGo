package com.associago.association.repository;

import com.associago.association.AssociationLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssociationLocationRepository extends JpaRepository<AssociationLocation, Long> {

    List<AssociationLocation> findByAssociationId(Long associationId);
}
