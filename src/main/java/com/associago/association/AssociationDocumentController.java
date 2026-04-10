package com.associago.association;

import com.associago.association.dto.AssociationDocumentDTO;
import com.associago.association.mapper.AssociationDocumentMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/associations/{associationId}/documents")
public class AssociationDocumentController {

    private final AssociationDocumentService documentService;

    public AssociationDocumentController(AssociationDocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public List<AssociationDocumentDTO> getAll(@PathVariable Long associationId) {
        return documentService.findByAssociationId(associationId).stream()
                .map(AssociationDocumentMapper::toDTO)
                .toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssociationDocumentDTO> upload(@PathVariable Long associationId,
                                                      @RequestParam("file") MultipartFile file,
                                                      @RequestParam("documentType") String documentType,
                                                      @RequestParam(value = "title", required = false) String title,
                                                      @RequestParam(value = "uploadedBy", required = false) Long uploadedBy)
            throws IOException {
        String resolvedTitle = (title == null || title.isBlank()) ? file.getOriginalFilename() : title;
        AssociationDocument doc = documentService.upload(associationId, documentType, resolvedTitle, file, uploadedBy);
        return ResponseEntity.ok(AssociationDocumentMapper.toDTO(doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
