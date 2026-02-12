package com.associago.association;

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
@RequestMapping("/api/associations")
public class AssociationController {

    private final AssociationService associationService;

    @Autowired
    public AssociationController(AssociationService associationService) {
        this.associationService = associationService;
    }

    @GetMapping
    public List<Association> getAllAssociations() {
        return associationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Association> getAssociationById(@PathVariable Long id) {
        return associationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Association createAssociation(@RequestBody Association association) {
        return associationService.create(association);
    }
    
    @PostMapping("/setup")
    public Association setupAssociation(@RequestBody Association association) {
        return associationService.create(association);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Association> updateAssociation(@PathVariable Long id, @RequestBody Association association) {
        try {
            return ResponseEntity.ok(associationService.update(id, association));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
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
