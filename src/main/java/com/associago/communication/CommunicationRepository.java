package com.associago.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunicationRepository extends JpaRepository<Communication, Long> {
    List<Communication> findByAssociationIdOrderByCreatedAtDesc(Long associationId);
}
