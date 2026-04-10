package com.associago.compliance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    /**
     * Logs an audit entry. Uses REQUIRES_NEW propagation so the audit
     * record is persisted even if the surrounding transaction rolls back.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditEntry log(Long associationId, Long userId, String action,
                          String entityType, Long entityId, String description) {
        AuditEntry entry = new AuditEntry();
        entry.setAssociationId(associationId);
        entry.setUserId(userId);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDescription(description);
        return repository.save(entry);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditEntry logWithValues(Long associationId, Long userId, String action,
                                    String entityType, Long entityId, String description,
                                    String oldValue, String newValue) {
        AuditEntry entry = new AuditEntry();
        entry.setAssociationId(associationId);
        entry.setUserId(userId);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDescription(description);
        entry.setOldValue(oldValue);
        entry.setNewValue(newValue);
        return repository.save(entry);
    }

    public Page<AuditEntry> getByAssociation(Long associationId, int page, int size) {
        return repository.findByAssociationIdOrderByCreatedAtDesc(associationId, PageRequest.of(page, size));
    }

    public List<AuditEntry> getByEntity(String entityType, Long entityId) {
        return repository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    public List<AuditEntry> getByDateRange(Long associationId, LocalDateTime from, LocalDateTime to) {
        return repository.findByAssociationIdAndCreatedAtBetweenOrderByCreatedAtDesc(associationId, from, to);
    }

    public long countByAssociation(Long associationId) {
        return repository.countByAssociationId(associationId);
    }
}
