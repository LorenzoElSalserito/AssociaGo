package com.associago.signature;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class SignatureService {

    private final InstitutionalSignatureRepository repository;

    public SignatureService(InstitutionalSignatureRepository repository) {
        this.repository = repository;
    }

    public List<InstitutionalSignature> getSignatures(Long associationId) {
        return repository.findByAssociationId(associationId);
    }

    public List<InstitutionalSignature> getActiveSignatures(Long associationId) {
        return repository.findByAssociationIdAndActiveTrue(associationId);
    }

    public InstitutionalSignature getByRole(Long associationId, String role) {
        return repository.findByAssociationIdAndSignerRole(associationId, role)
                .orElse(null);
    }

    @Transactional
    public InstitutionalSignature upsert(Long associationId, String signerRole,
                                         String signerName, String signerTitle) {
        InstitutionalSignature sig = repository
                .findByAssociationIdAndSignerRole(associationId, signerRole)
                .orElseGet(() -> {
                    InstitutionalSignature s = new InstitutionalSignature();
                    s.setAssociationId(associationId);
                    s.setSignerRole(signerRole);
                    return s;
                });
        sig.setSignerName(signerName);
        sig.setSignerTitle(signerTitle);
        return repository.save(sig);
    }

    @Transactional
    public InstitutionalSignature uploadImage(Long signatureId, MultipartFile file) throws IOException {
        InstitutionalSignature sig = repository.findById(signatureId)
                .orElseThrow(() -> new RuntimeException("Signature not found: " + signatureId));

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/png") && !contentType.startsWith("image/jpeg"))) {
            throw new IllegalArgumentException("Only PNG and JPEG images are accepted");
        }

        sig.setSignatureImage(file.getBytes());
        sig.setSignatureMimeType(contentType);
        return repository.save(sig);
    }

    @Transactional
    public void deleteImage(Long signatureId) {
        repository.findById(signatureId).ifPresent(sig -> {
            sig.setSignatureImage(null);
            sig.setSignatureMimeType(null);
            repository.save(sig);
        });
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    /**
     * Returns the raw image bytes for a given signature, or null if not found.
     */
    public byte[] getImageBytes(Long signatureId) {
        return repository.findById(signatureId)
                .map(InstitutionalSignature::getSignatureImage)
                .orElse(null);
    }

    public String getImageMimeType(Long signatureId) {
        return repository.findById(signatureId)
                .map(InstitutionalSignature::getSignatureMimeType)
                .orElse(null);
    }
}
