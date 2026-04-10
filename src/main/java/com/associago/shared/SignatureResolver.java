package com.associago.shared;

import com.associago.association.Association;
import com.associago.association.repository.AssociationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Risolve i firmatari attivi per un'associazione.
 * Utilizzato da tutti i moduli che necessitano firme automatiche:
 * CertificateService, AnnualBalanceService, GovernanceMinutesService, DocumentService.
 */
@Component
public class SignatureResolver {

    private final AssociationRepository associationRepository;
    private final String assetsPath;

    public SignatureResolver(AssociationRepository associationRepository,
                             @Value("${associago.assets.storage-path}") String assetsPath) {
        this.associationRepository = associationRepository;
        this.assetsPath = assetsPath;
    }

    /**
     * Preleva i firmatari attivi per un'associazione.
     *
     * @param associationId ID associazione
     * @param roles         Lista ruoli richiesti ("president", "secretary", "treasurer", "instructor")
     * @return Lista di SignerInfo con nome, cognome, carica, path immagine firma
     */
    public List<SignerInfo> resolveSigners(Long associationId, List<String> roles) {
        Association assoc = associationRepository.findById(associationId)
                .orElseThrow(() -> new IllegalArgumentException("Association not found: " + associationId));

        List<SignerInfo> signers = new ArrayList<>();

        for (String role : roles) {
            SignerInfo info = resolveRole(assoc, role);
            if (info != null) {
                signers.add(info);
            }
        }

        return signers;
    }

    /**
     * Verifica che tutti i firmatari richiesti siano configurati.
     */
    public List<String> getMissingSigners(Long associationId, List<String> roles) {
        Association assoc = associationRepository.findById(associationId)
                .orElseThrow(() -> new IllegalArgumentException("Association not found: " + associationId));

        List<String> missing = new ArrayList<>();
        for (String role : roles) {
            SignerInfo info = resolveRole(assoc, role);
            if (info == null || info.firstName() == null || info.firstName().isBlank()) {
                missing.add(role);
            }
        }
        return missing;
    }

    private SignerInfo resolveRole(Association assoc, String role) {
        return switch (role.toLowerCase()) {
            case "president" -> buildSignerInfo("president", assoc.getPresident(), "Presidente", assoc.getId());
            case "secretary" -> buildSignerInfo("secretary", assoc.getSecretary(), "Segretario", assoc.getId());
            case "treasurer" -> buildSignerInfo("treasurer", assoc.getTreasurer(), "Tesoriere", assoc.getId());
            case "vice_president" -> buildSignerInfo("vice_president", assoc.getVicePresident(), "Vice-Presidente", assoc.getId());
            default -> null;
        };
    }

    private SignerInfo buildSignerInfo(String role, String fullName, String title, Long associationId) {
        if (fullName == null || fullName.isBlank()) {
            return new SignerInfo(role, null, null, title, null);
        }

        String firstName;
        String lastName;
        String[] parts = fullName.trim().split("\\s+", 2);
        if (parts.length == 2) {
            firstName = parts[0];
            lastName = parts[1];
        } else {
            firstName = fullName;
            lastName = "";
        }

        // Cerca immagine firma nell'assets path
        String signaturePath = findSignatureImage(associationId, role);

        return new SignerInfo(role, firstName, lastName, title, signaturePath);
    }

    private String findSignatureImage(Long associationId, String role) {
        String basePath = assetsPath + "/" + associationId + "/signatures";
        for (String ext : new String[]{"png", "jpg", "jpeg"}) {
            Path path = Paths.get(basePath, role + "." + ext);
            if (Files.exists(path)) {
                return path.toString();
            }
        }
        return null;
    }

    public record SignerInfo(
            String role,
            String firstName,
            String lastName,
            String title,
            String signatureImagePath
    ) {}
}
