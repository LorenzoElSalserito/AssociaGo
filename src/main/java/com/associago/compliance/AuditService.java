package com.associago.compliance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    /** Paged log of one association, newest first; area, action and the inclusive date range are optional. */
    public Page<AuditEntry> search(Long associationId, String area, String action,
                                   LocalDateTime from, LocalDateTime to, int page, int size) {
        Specification<AuditEntry> spec = (root, query, cb) -> cb.equal(root.get("associationId"), associationId);
        if (area != null && !area.isBlank()) {
            List<String> types = AuditAreas.typesOf(area);
            spec = spec.and((root, query, cb) -> types.isEmpty() ? cb.disjunction() : root.get("entityType").in(types));
        }
        if (action != null && !action.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("action"), action.toUpperCase(java.util.Locale.ROOT)));
        }
        if (from != null) spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        if (to != null) spec = spec.and((root, query, cb) -> cb.lessThan(root.get("createdAt"), to));
        int safeSize = Math.max(1, Math.min(size, 200));
        return repository.findAll(spec, PageRequest.of(Math.max(0, page), safeSize,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));
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
