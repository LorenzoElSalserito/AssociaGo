package com.associago.association;

import com.associago.association.dto.AssociationLocationDTO;
import com.associago.association.dto.AssociationLocationUpsertDTO;
import com.associago.association.mapper.AssociationLocationMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/associations/{associationId}/locations")
public class AssociationLocationController {

    private final AssociationLocationService locationService;

    public AssociationLocationController(AssociationLocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public List<AssociationLocationDTO> getAll(@PathVariable Long associationId) {
        return locationService.findByAssociationId(associationId).stream()
                .map(AssociationLocationMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssociationLocationDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(AssociationLocationMapper.toDTO(locationService.findById(id)));
    }

    @PostMapping
    public AssociationLocationDTO create(@PathVariable Long associationId,
                                      @RequestBody AssociationLocationUpsertDTO location) {
        AssociationLocation entity = AssociationLocationMapper.toEntity(location);
        entity.setAssociationId(associationId);
        return AssociationLocationMapper.toDTO(locationService.create(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssociationLocationDTO> update(@PathVariable Long id,
                                                      @RequestBody AssociationLocationUpsertDTO location) {
        AssociationLocation entity = locationService.findById(id);
        AssociationLocationMapper.updateEntity(entity, location);
        return ResponseEntity.ok(AssociationLocationMapper.toDTO(locationService.update(id, entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
