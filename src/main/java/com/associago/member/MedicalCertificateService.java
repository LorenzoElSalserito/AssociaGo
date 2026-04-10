package com.associago.member;

import com.associago.member.dto.MedicalCertificateDTO;
import com.associago.member.dto.MedicalCertificateUpsertDTO;
import com.associago.member.repository.MedicalCertificateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class MedicalCertificateService {

    private final MedicalCertificateRepository repository;

    @Value("${associago.assets.storage-path}")
    private String storagePath;

    public MedicalCertificateService(MedicalCertificateRepository repository) {
        this.repository = repository;
    }

    public Optional<MedicalCertificateDTO> getByMember(Long memberId, Long associationId) {
        return repository.findByMemberIdAndAssociationId(memberId, associationId)
                .map(this::toDTO);
    }

    public List<MedicalCertificateDTO> getAllByAssociation(Long associationId) {
        return repository.findByAssociationId(associationId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<MedicalCertificateDTO> getExpiring(Long associationId, int days) {
        LocalDate now = LocalDate.now();
        LocalDate limit = now.plusDays(days);
        return repository.findByAssociationIdAndExpiryDateBetween(associationId, now, limit).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<MedicalCertificateDTO> getExpired(Long associationId) {
        return repository.findByAssociationIdAndExpiryDateBefore(associationId, LocalDate.now()).stream()
                .map(this::toDTO)
                .toList();
    }

    public MedicalCertificateDTO save(MedicalCertificateUpsertDTO dto) {
        MedicalCertificate cert = repository
                .findByMemberIdAndAssociationId(dto.memberId(), dto.associationId())
                .orElseGet(MedicalCertificate::new);

        cert.setMemberId(dto.memberId());
        cert.setAssociationId(dto.associationId());
        if (dto.certificateType() != null) cert.setCertificateType(dto.certificateType());
        if (dto.issueDate() != null) cert.setIssueDate(dto.issueDate());
        if (dto.expiryDate() != null) cert.setExpiryDate(dto.expiryDate());
        if (dto.issuedBy() != null) cert.setIssuedBy(dto.issuedBy());
        if (dto.medicalFacility() != null) cert.setMedicalFacility(dto.medicalFacility());
        if (dto.notes() != null) cert.setNotes(dto.notes());

        cert.setStatus(computeStatus(cert.getExpiryDate()));

        return toDTO(repository.save(cert));
    }

    public MedicalCertificateDTO uploadFile(Long id, MultipartFile file) throws IOException {
        MedicalCertificate cert = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical certificate not found: " + id));

        Path dir = Paths.get(storagePath, "medical-certificates");
        Files.createDirectories(dir);

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path filePath = dir.resolve(filename);
        file.transferTo(filePath.toFile());

        // Remove old file if exists
        if (cert.getFilePath() != null) {
            try { Files.deleteIfExists(Paths.get(cert.getFilePath())); } catch (IOException ignored) {}
        }

        cert.setFilePath(filePath.toString());
        return toDTO(repository.save(cert));
    }

    public void delete(Long id) {
        repository.findById(id).ifPresent(cert -> {
            if (cert.getFilePath() != null) {
                try { Files.deleteIfExists(Paths.get(cert.getFilePath())); } catch (IOException ignored) {}
            }
            repository.delete(cert);
        });
    }

    private String computeStatus(LocalDate expiryDate) {
        if (expiryDate == null) return "MISSING";
        LocalDate now = LocalDate.now();
        if (expiryDate.isBefore(now)) return "EXPIRED";
        if (expiryDate.isBefore(now.plusDays(30))) return "EXPIRING_SOON";
        return "VALID";
    }

    private MedicalCertificateDTO toDTO(MedicalCertificate c) {
        return new MedicalCertificateDTO(
                c.getId(), c.getMemberId(), c.getAssociationId(),
                c.getCertificateType(), c.getIssueDate(), c.getExpiryDate(),
                c.getIssuedBy(), c.getMedicalFacility(), c.getFilePath(),
                c.getStatus(), c.getNotes(), c.getCreatedAt(), c.getUpdatedAt()
        );
    }

    private String getExtension(String filename) {
        if (filename == null) return ".pdf";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".pdf";
    }
}
