package com.associago.shared;

import com.associago.association.Association;
import com.associago.association.repository.AssociationRepository;
import com.associago.shared.i18n.Messages;
import com.associago.shared.pdf.PdfDocument;
import com.associago.signature.InstitutionalSignature;
import com.associago.signature.InstitutionalSignatureRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Risolve i firmatari attivi per un'associazione.
 * Fonte primaria: Impostazioni › Firme (institutional_signatures: nome, carica, immagine).
 * Fallback: nomi dell'Organigramma e immagini in assets/{id}/signatures/{role}.png|jpg.
 * Utilizzato da AnnualBalanceService, CertificateService e dal verbale di assemblea.
 */
@Component
public class SignatureResolver {

    private final AssociationRepository associationRepository;
    private final InstitutionalSignatureRepository signatureRepository;
    private final String assetsPath;

    public SignatureResolver(AssociationRepository associationRepository,
                             InstitutionalSignatureRepository signatureRepository,
                             @Value("${associago.assets.storage-path}") String assetsPath) {
        this.associationRepository = associationRepository;
        this.signatureRepository = signatureRepository;
        this.assetsPath = assetsPath;
    }

    /**
     * Preleva i firmatari per un'associazione.
     *
     * @param associationId ID associazione
     * @param roles         Ruoli richiesti ("president", "secretary", "treasurer", "vice_president"; maiuscole ammesse)
     * @return un SignerInfo per ogni ruolo noto, anche senza nome configurato
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
     * Ruoli richiesti senza un nome né in Impostazioni › Firme né nell'Organigramma.
     */
    public List<String> getMissingSigners(Long associationId, List<String> roles) {
        Association assoc = associationRepository.findById(associationId)
                .orElseThrow(() -> new IllegalArgumentException("Association not found: " + associationId));

        List<String> missing = new ArrayList<>();
        for (String role : roles) {
            SignerInfo info = resolveRole(assoc, role);
            if (info == null || !info.hasName()) {
                missing.add(role);
            }
        }
        return missing;
    }

    private SignerInfo resolveRole(Association assoc, String role) {
        String key = role.toLowerCase(Locale.ROOT);
        String organigramName = switch (key) {
            case "president" -> assoc.getPresident();
            case "secretary" -> assoc.getSecretary();
            case "treasurer" -> assoc.getTreasurer();
            case "vice_president" -> assoc.getVicePresident();
            default -> null;
        };
        InstitutionalSignature stored = findStored(assoc.getId(), key);
        if (organigramName == null && stored == null && !List.of("president", "secretary", "treasurer", "vice_president").contains(key)) {
            return null;
        }

        String fullName = stored != null && notBlank(stored.getSignerName()) ? stored.getSignerName() : organigramName;
        String title = stored != null && notBlank(stored.getSignerTitle()) ? stored.getSignerTitle() : null;
        byte[] image = stored != null ? stored.getSignatureImage() : null;
        String imagePath = image == null || image.length == 0 ? findSignatureImage(assoc.getId(), key) : null;

        if (!notBlank(fullName)) {
            return new SignerInfo(key, null, null, title, imagePath, image);
        }
        String[] parts = fullName.trim().split("\\s+", 2);
        return new SignerInfo(key, parts[0], parts.length == 2 ? parts[1] : "", title, imagePath, image);
    }

    private InstitutionalSignature findStored(Long associationId, String role) {
        if (signatureRepository == null || associationId == null) return null;
        try {
            return signatureRepository.findByAssociationIdAndSignerRole(associationId, role.toUpperCase(Locale.ROOT))
                    .filter(InstitutionalSignature::isActive)
                    .orElse(null);
        } catch (RuntimeException e) {
            return null;
        }
    }

    private String findSignatureImage(Long associationId, String role) {
        if (assetsPath == null || associationId == null) return null;
        String basePath = assetsPath + "/" + associationId + "/signatures";
        for (String ext : new String[]{"png", "jpg", "jpeg"}) {
            Path path = Paths.get(basePath, role + "." + ext);
            if (Files.exists(path)) {
                return path.toString();
            }
        }
        return null;
    }

    private static boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    /**
     * @param title             carica personalizzata da Impostazioni › Firme; null = etichetta localizzata del ruolo
     * @param signatureImage    immagine salvata nel database (preferita)
     * @param signatureImagePath immagine su disco, usata solo se manca quella nel database
     */
    public record SignerInfo(
            String role,
            String firstName,
            String lastName,
            String title,
            String signatureImagePath,
            byte[] signatureImage
    ) {
        public SignerInfo(String role, String firstName, String lastName, String title, String signatureImagePath) {
            this(role, firstName, lastName, title, signatureImagePath, null);
        }

        public boolean hasName() {
            return firstName != null && !firstName.isBlank();
        }

        public String fullName() {
            if (!hasName()) return "";
            return (firstName + " " + (lastName == null ? "" : lastName)).trim();
        }

        /** Image bytes from the database or the file fallback; null when absent or unreadable. */
        public byte[] imageBytes() {
            if (signatureImage != null && signatureImage.length > 0) return signatureImage;
            if (signatureImagePath == null) return null;
            try {
                return Files.readAllBytes(Path.of(signatureImagePath));
            } catch (Exception e) {
                return null;
            }
        }

        /** Signature block for a PDF, with the custom title or the localized role name. */
        public PdfDocument.SignatureBlock toBlock(Messages messages, Locale locale) {
            String roleLabel = title != null && !title.isBlank() ? title : messages.label(locale, "role", role);
            return new PdfDocument.SignatureBlock(fullName(), roleLabel, imageBytes());
        }
    }
}
