package com.associago.compliance;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public Page<AuditEntry> getByAssociation(
            @RequestParam Long associationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return auditService.getByAssociation(associationId, page, size);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public List<AuditEntry> getByEntity(@PathVariable String entityType, @PathVariable Long entityId) {
        return auditService.getByEntity(entityType, entityId);
    }

    @GetMapping("/range")
    public List<AuditEntry> getByDateRange(
            @RequestParam Long associationId,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return auditService.getByDateRange(associationId,
                from.atStartOfDay(), to.plusDays(1).atStartOfDay());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam Long associationId) {
        return ResponseEntity.ok(auditService.countByAssociation(associationId));
    }
}
