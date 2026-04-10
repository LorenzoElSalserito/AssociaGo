package com.associago.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunicationTemplateRepository extends JpaRepository<CommunicationTemplate, Long> {
    List<CommunicationTemplate> findByAssociationId(Long associationId);
    List<CommunicationTemplate> findByAssociationIdAndCategory(Long associationId, String category);
}
