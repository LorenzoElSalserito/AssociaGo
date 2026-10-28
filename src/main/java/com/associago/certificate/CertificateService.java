package com.associago.certificate;

import com.associago.activity.Activity;
import com.associago.activity.ActivityParticipant;
import com.associago.activity.ActivityService;
import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.event.Event;
import com.associago.event.EventParticipant;
import com.associago.event.EventService;
import com.associago.shared.SignatureResolver;
import com.associago.shared.i18n.Messages;
import com.associago.shared.pdf.PdfDocument;
import com.associago.shared.pdf.PdfText;
import com.associago.user.User;
import com.associago.user.UserService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import javax.imageio.ImageIO;

@Service
public class CertificateService {

    private final CertificateTemplateRepository templateRepository;
    private final IssuedCertificateRepository issuedRepository;
    private final UserService userService;
    private final ActivityService activityService;
    private final EventService eventService;
    private final AssociationService associationService;
    private final SignatureResolver signatureResolver;
    private final Messages messages;

    public CertificateService(CertificateTemplateRepository templateRepository,
                              IssuedCertificateRepository issuedRepository,
                              UserService userService,
                              ActivityService activityService,
                              EventService eventService,
                              AssociationService associationService,
                              SignatureResolver signatureResolver,
                              Messages messages) {
        this.templateRepository = templateRepository;
        this.issuedRepository = issuedRepository;
        this.userService = userService;
        this.activityService = activityService;
        this.eventService = eventService;
        this.associationService = associationService;
        this.signatureResolver = signatureResolver;
        this.messages = messages;
    }

    // --- Templates ---

    public List<CertificateTemplate> getTemplates(Long associationId) {
        return templateRepository.findByAssociationId(associationId);
    }

    public CertificateTemplate getTemplate(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate template not found: " + id));
    }

    @Transactional
    public CertificateTemplate saveTemplate(CertificateTemplate template) {
        template.setUpdatedAt(LocalDateTime.now());
        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }

    // --- Issued Certificates ---

    public List<IssuedCertificate> getIssuedByAssociation(Long associationId) {
        return issuedRepository.findByAssociationId(associationId);
    }

    public List<IssuedCertificate> getIssuedByActivity(Long activityId) {
        return issuedRepository.findByActivityId(activityId);
    }

    public List<IssuedCertificate> getIssuedByEvent(Long eventId) {
        return issuedRepository.findByEventId(eventId);
    }

    /**
     * Issues a single certificate for a specific user.
     */
    @Transactional
    public IssuedCertificate issueCertificate(Long templateId, Long userId, Long associationId,
                                               Long activityId, Long eventId, Long issuedBy) {
        CertificateTemplate template = getTemplate(templateId);
        // issued_certificates.user_id references users(id): recipients are the people listed in Soci.
        User recipient = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found: " + userId));
        Association association = associationService.findById(associationId).orElse(new Association());

        String body = mergeCertificateBody(template.getBodyHtml(), recipient, association, activityId, eventId);

        IssuedCertificate cert = new IssuedCertificate();
        cert.setAssociationId(associationId);
        cert.setTemplateId(templateId);
        cert.setUserId(userId);
        cert.setActivityId(activityId);
        cert.setEventId(eventId);
        cert.setCertificateNumber(generateCertNumber(associationId));
        cert.setIssueDate(LocalDate.now());
        cert.setIssuedBy(issuedBy);
        cert.setTitle(template.getName());
        cert.setBodySnapshot(body);
        cert.setSignatories(buildSignatories(association, template.getSignatoryRoles()));

        IssuedCertificate saved = issuedRepository.save(cert);
        generateQrCode(saved);
        return saved;
    }

    /**
     * Batch issue certificates for all participants of an activity.
     */
    @Transactional
    public List<IssuedCertificate> batchIssueForActivity(Long templateId, Long activityId,
                                                          Long associationId, Long issuedBy) {
        List<ActivityParticipant> participants = activityService.findParticipantsByActivityId(activityId);
        List<IssuedCertificate> issued = new ArrayList<>();
        for (ActivityParticipant p : participants) {
            if (p.isActive()) {
                if (p.getUser() != null) {
                    issued.add(issueCertificate(templateId, p.getUser().getId(), associationId, activityId, null, issuedBy));
                }
            }
        }
        return issued;
    }

    /**
     * Batch issue certificates for all participants of an event.
     */
    @Transactional
    public List<IssuedCertificate> batchIssueForEvent(Long templateId, Long eventId,
                                                       Long associationId, Long issuedBy) {
        List<EventParticipant> participants = eventService.getParticipants(eventId);
        List<IssuedCertificate> issued = new ArrayList<>();
        for (EventParticipant p : participants) {
            // Guests have no user record and cannot receive a nominal certificate.
            if (p.getUser() != null) {
                issued.add(issueCertificate(templateId, p.getUser().getId(), associationId, null, eventId, issuedBy));
            }
        }
        return issued;
    }

    /**
     * Generates a PDF for a specific issued certificate, in the requested language, signed by the
     * template's signatory roles (Impostazioni › Firme, falling back to the Organigramma).
     */
    public byte[] generatePdf(Long issuedCertificateId, Locale locale) throws IOException {
        IssuedCertificate cert = issuedRepository.findById(issuedCertificateId)
                .orElseThrow(() -> new RuntimeException("Issued certificate not found: " + issuedCertificateId));
        CertificateTemplate template = getTemplate(cert.getTemplateId());
        List<String> roles = signatoryRoles(template.getSignatoryRoles());
        List<SignatureResolver.SignerInfo> signers = roles.isEmpty() || cert.getAssociationId() == null
                ? List.of() : signatureResolver.resolveSigners(cert.getAssociationId(), roles);

        byte[] pdfBytes = renderPdf(cert, template, signers, locale);
        try {
            cert.setChecksum(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(pdfBytes)));
            issuedRepository.save(cert);
        } catch (Exception e) {
            // Non-critical
        }
        return pdfBytes;
    }

    /** Lays out the certificate: centred title, number and date, body, signatures and QR code. */
    public byte[] renderPdf(IssuedCertificate cert, CertificateTemplate template,
                            List<SignatureResolver.SignerInfo> signers, Locale locale) throws IOException {
        boolean landscape = "LANDSCAPE".equals(template.getOrientation());
        PDRectangle size = landscape ? new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()) : PDRectangle.A4;

        try (PdfDocument pdf = new PdfDocument(size, null)) {
            float pageWidth = pdf.width();
            float pageHeight = pdf.height();
            String title = cert.getTitle() == null ? "" : cert.getTitle();
            pdf.textCentered(pageWidth / 2, pageHeight - 100, pdf.fit(title, pdf.bold, 24, pdf.contentWidth()), pdf.bold, 24);
            pdf.textCentered(pageWidth / 2, pageHeight - 125, messages.get(locale, "certificate.numberAndDate",
                    Objects.requireNonNullElse(cert.getCertificateNumber(), ""), PdfText.date(cert.getIssueDate(), locale)),
                    pdf.regular, 10);

            // Body (plain text rendering of the HTML snapshot)
            String plainBody = cert.getBodySnapshot() != null
                    ? cert.getBodySnapshot()
                        .replaceAll("(?i)<br\\s*/?>|</p>", "\n")
                        .replaceAll("<[^>]*>", "")
                        .replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
                        .trim()
                    : "";
            pdf.moveTo(pageHeight - 170);
            pdf.paragraph(pdf.left() + 20, plainBody, pdf.regular, 13);

            float qrSize = 80;
            List<PdfDocument.SignatureBlock> blocks = (signers == null ? List.<SignatureResolver.SignerInfo>of() : signers).stream()
                    .map(signer -> signer.toBlock(messages, locale))
                    .toList();
            if (!blocks.isEmpty()) {
                pdf.moveTo(Math.min(pdf.y() - 20, 40 + qrSize + 115));
                pdf.signatures(null, blocks);
            }

            if (cert.getQrCodeData() != null) {
                byte[] qrPng = renderQrCodePng(cert.getQrCodeData(), 150);
                pdf.image(qrPng, "qr.png", pageWidth - qrSize - 30, 20, qrSize, qrSize);
            }
            return pdf.finish(null);
        }
    }

    /** Roles listed in the template JSON (e.g. ["PRESIDENT","SECRETARY"]), lower-cased for the resolver. */
    static List<String> signatoryRoles(String signatoryRolesJson) {
        if (signatoryRolesJson == null) return List.of();
        List<String> roles = new ArrayList<>();
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("[A-Za-z_]+").matcher(signatoryRolesJson);
        while (matcher.find()) {
            String role = matcher.group().toLowerCase(Locale.ROOT);
            if (!roles.contains(role)) roles.add(role);
        }
        return roles;
    }

    // --- QR Code ---

    /**
     * Generates a QR code for the given certificate and saves the payload in qrCodeData.
     */
    private void generateQrCode(IssuedCertificate cert) {
        try {
            String payload = String.format("{\"cert\":\"%s\",\"assoc\":%d,\"date\":\"%s\"}",
                    cert.getCertificateNumber(),
                    cert.getAssociationId(),
                    cert.getIssueDate() != null ? cert.getIssueDate().toString() : "");
            cert.setQrCodeData(payload);
            issuedRepository.save(cert);
        } catch (Exception e) {
            // Non-critical: QR data generation failure should not block issuance
        }
    }

    /**
     * Renders a QR code as a PNG byte array from the given text payload.
     */
    private byte[] renderQrCodePng(String payload, int size) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(payload, BarcodeFormat.QR_CODE, size, size,
                    Map.of(EncodeHintType.MARGIN, 1));
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream pngOut = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", pngOut);
            return pngOut.toByteArray();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Retrieves the certificate for public verification by number and checksum.
     */
    public IssuedCertificate findByCertificateNumberAndChecksum(String number, String checksum) {
        List<IssuedCertificate> all = issuedRepository.findAll();
        return all.stream()
                .filter(c -> number.equals(c.getCertificateNumber()))
                .filter(c -> checksum.equals(c.getChecksum()))
                .findFirst()
                .orElse(null);
    }

    // --- Helpers ---

    private String mergeCertificateBody(String bodyHtml, User member, Association association,
                                         Long activityId, Long eventId) {
        String body = bodyHtml;
        body = body.replace("{{firstName}}", member.getFirstName() != null ? member.getFirstName() : "");
        body = body.replace("{{lastName}}", member.getLastName() != null ? member.getLastName() : "");
        body = body.replace("{{fiscalCode}}", member.getTaxCode() != null ? member.getTaxCode() : "");
        body = body.replace("{{associationName}}", association.getName() != null ? association.getName() : "");
        body = body.replace("{{date}}", PdfText.date(LocalDate.now(), messages.current()));

        if (activityId != null) {
            activityService.findById(activityId).ifPresent(a -> {
                // Cannot modify local variable body from lambda, so use replace chain
            });
            Activity activity = activityService.findById(activityId).orElse(null);
            if (activity != null) {
                body = body.replace("{{activityName}}", activity.getName() != null ? activity.getName() : "");
                body = body.replace("{{activityCategory}}", activity.getCategory() != null ? activity.getCategory() : "");
            }
        }
        if (eventId != null) {
            Event event = eventService.getEventById(eventId).orElse(null);
            if (event != null) {
                body = body.replace("{{eventName}}", event.getName() != null ? event.getName() : "");
                body = body.replace("{{eventType}}", event.getType() != null ? event.getType() : "");
            }
        }
        return body;
    }

    private String buildSignatories(Association association, String signatoryRolesJson) {
        // Build JSON array from association officer data
        StringBuilder sb = new StringBuilder("[");
        if (signatoryRolesJson != null && signatoryRolesJson.contains("PRESIDENT") && association.getPresident() != null) {
            sb.append("{\"name\":\"").append(association.getPresident()).append("\",\"role\":\"PRESIDENT\"}");
        }
        if (signatoryRolesJson != null && signatoryRolesJson.contains("SECRETARY") && association.getSecretary() != null) {
            if (sb.length() > 1) sb.append(",");
            sb.append("{\"name\":\"").append(association.getSecretary()).append("\",\"role\":\"SECRETARY\"}");
        }
        if (signatoryRolesJson != null && signatoryRolesJson.contains("TREASURER") && association.getTreasurer() != null) {
            if (sb.length() > 1) sb.append(",");
            sb.append("{\"name\":\"").append(association.getTreasurer()).append("\",\"role\":\"TREASURER\"}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String generateCertNumber(Long associationId) {
        long count = issuedRepository.countByAssociationId(associationId);
        return String.format("CERT-%d-%04d", LocalDate.now().getYear(), count + 1);
    }
}
