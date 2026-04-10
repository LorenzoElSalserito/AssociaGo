package com.associago.signature;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/signatures")
public class SignatureController {

    private final SignatureService signatureService;

    public SignatureController(SignatureService signatureService) {
        this.signatureService = signatureService;
    }

    @GetMapping
    public List<InstitutionalSignature> getAll(@RequestParam Long associationId) {
        return signatureService.getSignatures(associationId);
    }

    @GetMapping("/active")
    public List<InstitutionalSignature> getActive(@RequestParam Long associationId) {
        return signatureService.getActiveSignatures(associationId);
    }

    @PostMapping
    public InstitutionalSignature upsert(@RequestBody Map<String, Object> body) {
        Long associationId = ((Number) body.get("associationId")).longValue();
        String signerRole = (String) body.get("signerRole");
        String signerName = (String) body.get("signerName");
        String signerTitle = (String) body.get("signerTitle");
        return signatureService.upsert(associationId, signerRole, signerName, signerTitle);
    }

    @PostMapping("/{id}/image")
    public InstitutionalSignature uploadImage(@PathVariable Long id,
                                              @RequestParam("file") MultipartFile file) throws IOException {
        return signatureService.uploadImage(id, file);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        byte[] data = signatureService.getImageBytes(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        String mimeType = signatureService.getImageMimeType(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType != null ? mimeType : "image/png"))
                .body(data);
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        signatureService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        signatureService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
