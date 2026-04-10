package com.associago.compliance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditEntry, Long> {

    Page<AuditEntry> findByAssociationIdOrderByCreatedAtDesc(Long associationId, Pageable pageable);

    List<AuditEntry> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);

    List<AuditEntry> findByAssociationIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long associationId, LocalDateTime from, LocalDateTime to);

    long countByAssociationId(Long associationId);
}
