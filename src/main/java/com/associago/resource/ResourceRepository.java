package com.associago.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByAssociationId(Long associationId);
    List<Resource> findByAssociationIdAndActiveTrue(Long associationId);
    List<Resource> findByAssociationIdAndType(Long associationId, String type);
}
