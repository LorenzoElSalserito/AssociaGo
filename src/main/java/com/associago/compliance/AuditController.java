package com.associago.compliance;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditEntry>> getByAssociation(
            @RequestParam(required = false) Long associationId,
            @RequestHeader(value = "X-Association-Id", required = false) Long headerAssociationId,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Long assoc = associationId != null ? associationId : headerAssociationId;
        if (assoc == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(auditService.search(assoc, area, action,
                from == null ? null : from.atStartOfDay(),
                to == null ? null : to.plusDays(1).atStartOfDay(), page, size));
    }

    @GetMapping("/areas")
    public Map<String, List<String>> areas() {
        return AuditAreas.areas();
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
