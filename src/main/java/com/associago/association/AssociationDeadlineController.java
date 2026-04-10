package com.associago.association;

import com.associago.association.dto.AssociationDeadlineDTO;
import com.associago.association.dto.AssociationDeadlineUpsertDTO;
import com.associago.association.mapper.AssociationDeadlineMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/associations/{associationId}/deadlines")
public class AssociationDeadlineController {

    private final AssociationDeadlineService deadlineService;

    public AssociationDeadlineController(AssociationDeadlineService deadlineService) {
        this.deadlineService = deadlineService;
    }

    @GetMapping
    public List<AssociationDeadlineDTO> getAll(@PathVariable Long associationId) {
        return deadlineService.findByAssociationId(associationId).stream()
                .map(AssociationDeadlineMapper::toDTO)
                .toList();
    }

    @GetMapping("/pending")
    public List<AssociationDeadlineDTO> getPending(@PathVariable Long associationId) {
        return deadlineService.findPending(associationId).stream()
                .map(AssociationDeadlineMapper::toDTO)
                .toList();
    }

    @PostMapping
    public AssociationDeadlineDTO create(@PathVariable Long associationId,
                                      @RequestBody AssociationDeadlineUpsertDTO deadline) {
        AssociationDeadline entity = AssociationDeadlineMapper.toEntity(deadline);
        entity.setAssociationId(associationId);
        return AssociationDeadlineMapper.toDTO(deadlineService.create(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssociationDeadlineDTO> update(@PathVariable Long id,
                                                      @RequestBody AssociationDeadlineUpsertDTO deadline) {
        AssociationDeadline entity = deadlineService.findById(id);
        AssociationDeadlineMapper.updateEntity(entity, deadline);
        return ResponseEntity.ok(AssociationDeadlineMapper.toDTO(deadlineService.update(id, entity)));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<AssociationDeadlineDTO> complete(@PathVariable Long id,
                                                        @RequestParam(required = false) Long completedBy) {
        return ResponseEntity.ok(AssociationDeadlineMapper.toDTO(deadlineService.complete(id, completedBy)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deadlineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
