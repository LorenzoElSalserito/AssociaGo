package com.associago.association;

import com.associago.association.dto.AssociationCreateDTO;
import com.associago.association.dto.AssociationDTO;
import com.associago.association.dto.AssociationUpdateDTO;
import com.associago.association.mapper.AssociationMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping({"/api/associations", "/api/v1/associations"})
public class AssociationController {

    private final AssociationService associationService;

    @Autowired
    public AssociationController(AssociationService associationService) {
        this.associationService = associationService;
    }

    @GetMapping
    public List<AssociationDTO> getAllAssociations() {
        return associationService.findAll().stream()
                .map(AssociationMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssociationDTO> getAssociationById(@PathVariable Long id) {
        return associationService.findById(id)
                .map(AssociationMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AssociationDTO createAssociation(@Valid @RequestBody AssociationCreateDTO dto) {
        Association entity = AssociationMapper.toEntity(dto);
        return AssociationMapper.toDTO(associationService.create(entity));
    }

    @PostMapping("/setup")
    public AssociationDTO setupAssociation(@Valid @RequestBody AssociationCreateDTO dto) {
        Association entity = AssociationMapper.toEntity(dto);
        return AssociationMapper.toDTO(associationService.create(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssociationDTO> updateAssociation(@PathVariable Long id,
                                                            @Valid @RequestBody AssociationUpdateDTO dto) {
        return associationService.findById(id)
                .map(existing -> {
                    AssociationMapper.updateEntity(existing, dto);
                    Association updated = associationService.update(id, existing);
                    return ResponseEntity.ok(AssociationMapper.toDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssociation(@PathVariable Long id) {
        associationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Logo Management ---

    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            associationService.updateLogo(id, file.getBytes());
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<byte[]> getLogo(@PathVariable Long id) {
        byte[] logo = associationService.getLogo(id);
        if (logo == null || logo.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE) // Default to PNG, browser handles detection usually
                .body(logo);
    }
}
