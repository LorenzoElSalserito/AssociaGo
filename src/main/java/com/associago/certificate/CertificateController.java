package com.associago.certificate;

import com.associago.certificate.dto.CertificateTemplateDTO;
import com.associago.certificate.dto.CertificateTemplateUpsertDTO;
import com.associago.certificate.dto.IssuedCertificateDTO;
import com.associago.certificate.mapper.CertificateMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    // --- Templates ---

    @GetMapping("/templates")
    public List<CertificateTemplateDTO> getTemplates(@RequestParam Long associationId) {
        return certificateService.getTemplates(associationId).stream()
                .map(CertificateMapper::toDTO)
                .toList();
    }

    @GetMapping("/templates/{id}")
    public CertificateTemplateDTO getTemplate(@PathVariable Long id) {
        return CertificateMapper.toDTO(certificateService.getTemplate(id));
    }

    @PostMapping("/templates")
    public CertificateTemplateDTO createTemplate(@RequestBody CertificateTemplateUpsertDTO template) {
        CertificateTemplate entity = CertificateMapper.toEntity(template);
        return CertificateMapper.toDTO(certificateService.saveTemplate(entity));
    }

    @PutMapping("/templates/{id}")
    public CertificateTemplateDTO updateTemplate(@PathVariable Long id, @RequestBody CertificateTemplateUpsertDTO template) {
        CertificateTemplate entity = certificateService.getTemplate(id);
        CertificateMapper.updateEntity(entity, template);
        entity.setId(id);
        return CertificateMapper.toDTO(certificateService.saveTemplate(entity));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        certificateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    // --- Issue ---

    @GetMapping
    public List<IssuedCertificateDTO> getIssued(@RequestParam Long associationId) {
        return certificateService.getIssuedByAssociation(associationId).stream()
                .map(CertificateMapper::toDTO)
                .toList();
    }

    @PostMapping("/issue")
    public IssuedCertificateDTO issue(@RequestParam Long templateId,
                                    @RequestParam Long userId,
                                    @RequestParam Long associationId,
                                    @RequestParam(required = false) Long activityId,
                                    @RequestParam(required = false) Long eventId,
                                    @RequestParam(required = false) Long issuedBy) {
        return CertificateMapper.toDTO(certificateService.issueCertificate(templateId, userId, associationId, activityId, eventId, issuedBy));
    }

    @PostMapping("/batch/activity/{activityId}")
    public List<IssuedCertificateDTO> batchActivity(@PathVariable Long activityId,
                                                   @RequestParam Long templateId,
                                                   @RequestParam Long associationId,
                                                   @RequestParam(required = false) Long issuedBy) {
        return certificateService.batchIssueForActivity(templateId, activityId, associationId, issuedBy).stream()
                .map(CertificateMapper::toDTO)
                .toList();
    }

    @PostMapping("/batch/event/{eventId}")
    public List<IssuedCertificateDTO> batchEvent(@PathVariable Long eventId,
                                                @RequestParam Long templateId,
                                                @RequestParam Long associationId,
                                                @RequestParam(required = false) Long issuedBy) {
        return certificateService.batchIssueForEvent(templateId, eventId, associationId, issuedBy).stream()
                .map(CertificateMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) throws IOException {
        byte[] pdf = certificateService.generatePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attestato_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * Public verification endpoint (no auth required).
     * Validates a certificate by number and checksum.
     */
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyCertificate(
            @RequestParam String number,
            @RequestParam String checksum) {
        IssuedCertificate cert = certificateService.findByCertificateNumberAndChecksum(number, checksum);
        Map<String, Object> response = new LinkedHashMap<>();
        if (cert == null) {
            response.put("valid", false);
            response.put("message", "Certificate not found or checksum mismatch.");
            return ResponseEntity.ok(response);
        }
        response.put("valid", !"REVOKED".equals(cert.getStatus()));
        response.put("certificateNumber", cert.getCertificateNumber());
        response.put("issueDate", cert.getIssueDate());
        response.put("title", cert.getTitle());
        response.put("status", cert.getStatus());
        response.put("associationId", cert.getAssociationId());
        return ResponseEntity.ok(response);
    }
}
