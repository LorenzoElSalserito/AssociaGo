package com.associago.certificate;

import com.associago.activity.Activity;
import com.associago.activity.ActivityParticipant;
import com.associago.activity.ActivityService;
import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.event.Event;
import com.associago.event.EventParticipant;
import com.associago.event.EventService;
import com.associago.member.Member;
import com.associago.member.MemberService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;

@Service
public class CertificateService {

    private final CertificateTemplateRepository templateRepository;
    private final IssuedCertificateRepository issuedRepository;
    private final MemberService memberService;
    private final ActivityService activityService;
    private final EventService eventService;
    private final AssociationService associationService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public CertificateService(CertificateTemplateRepository templateRepository,
                              IssuedCertificateRepository issuedRepository,
                              MemberService memberService,
                              ActivityService activityService,
                              EventService eventService,
                              AssociationService associationService) {
        this.templateRepository = templateRepository;
        this.issuedRepository = issuedRepository;
        this.memberService = memberService;
        this.activityService = activityService;
        this.eventService = eventService;
        this.associationService = associationService;
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
        Member member = memberService.getMemberById(userId)
                .orElseThrow(() -> new RuntimeException("Member not found: " + userId));
        Association association = associationService.findById(associationId).orElse(new Association());

        String body = mergeCertificateBody(template.getBodyHtml(), member, association, activityId, eventId);

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
                issued.add(issueCertificate(templateId, p.getId(), associationId,
                        activityId, null, issuedBy));
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
            issued.add(issueCertificate(templateId, p.getId(), associationId,
                    null, eventId, issuedBy));
        }
        return issued;
    }

    /**
     * Generates a PDF for a specific issued certificate.
     */
    public byte[] generatePdf(Long issuedCertificateId) throws IOException {
        IssuedCertificate cert = issuedRepository.findById(issuedCertificateId)
                .orElseThrow(() -> new RuntimeException("Issued certificate not found: " + issuedCertificateId));

        CertificateTemplate template = getTemplate(cert.getTemplateId());
        boolean landscape = "LANDSCAPE".equals(template.getOrientation());

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(landscape ? new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()) : PDRectangle.A4);
            document.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                // Title
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 24);
                float titleWidth = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD).getStringWidth(cert.getTitle()) / 1000 * 24;
                cs.newLineAtOffset((pageWidth - titleWidth) / 2, pageHeight - 100);
                cs.showText(cert.getTitle());
                cs.endText();

                // Certificate number & date
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                cs.newLineAtOffset(50, pageHeight - 140);
                cs.showText("N. " + cert.getCertificateNumber() + "  —  " + cert.getIssueDate().format(DATE_FMT));
                cs.endText();

                // Body (plain text rendering of HTML snapshot)
                String plainBody = cert.getBodySnapshot() != null
                        ? cert.getBodySnapshot().replaceAll("<[^>]*>", "").replaceAll("&nbsp;", " ").trim()
                        : "";
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                cs.setLeading(16);
                cs.newLineAtOffset(60, pageHeight - 200);
                for (String line : wrapText(plainBody, 80)) {
                    cs.showText(line);
                    cs.newLine();
                }
                cs.endText();

                // Signatories footer
                if (cert.getSignatories() != null && !cert.getSignatories().isEmpty()) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 10);
                    cs.newLineAtOffset(50, 80);
                    cs.showText("Firmatari: " + cert.getSignatories()
                            .replaceAll("[\\[\\]\"{}]", "")
                            .replace(",", ", "));
                    cs.endText();
                }

                // QR Code (bottom-right corner)
                if (cert.getQrCodeData() != null) {
                    byte[] qrPng = renderQrCodePng(cert.getQrCodeData(), 150);
                    if (qrPng != null) {
                        PDImageXObject qrImage = PDImageXObject.createFromByteArray(document, qrPng, "qr.png");
                        float qrSize = 80;
                        cs.drawImage(qrImage, pageWidth - qrSize - 30, 20, qrSize, qrSize);
                    }
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            byte[] pdfBytes = baos.toByteArray();

            // Compute checksum
            try {
                String sha256 = HexFormat.of().formatHex(
                        MessageDigest.getInstance("SHA-256").digest(pdfBytes));
                cert.setChecksum(sha256);
                issuedRepository.save(cert);
            } catch (Exception e) {
                // Non-critical
            }

            return pdfBytes;
        }
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

    private String mergeCertificateBody(String bodyHtml, Member member, Association association,
                                         Long activityId, Long eventId) {
        String body = bodyHtml;
        body = body.replace("{{firstName}}", member.getFirstName() != null ? member.getFirstName() : "");
        body = body.replace("{{lastName}}", member.getLastName() != null ? member.getLastName() : "");
        body = body.replace("{{fiscalCode}}", member.getFiscalCode() != null ? member.getFiscalCode() : "");
        body = body.replace("{{associationName}}", association.getName() != null ? association.getName() : "");
        body = body.replace("{{date}}", LocalDate.now().format(DATE_FMT));

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
            sb.append("{\"name\":\"").append(association.getPresident()).append("\",\"role\":\"Presidente\"}");
        }
        if (signatoryRolesJson != null && signatoryRolesJson.contains("SECRETARY") && association.getSecretary() != null) {
            if (sb.length() > 1) sb.append(",");
            sb.append("{\"name\":\"").append(association.getSecretary()).append("\",\"role\":\"Segretario\"}");
        }
        if (signatoryRolesJson != null && signatoryRolesJson.contains("TREASURER") && association.getTreasurer() != null) {
            if (sb.length() > 1) sb.append(",");
            sb.append("{\"name\":\"").append(association.getTreasurer()).append("\",\"role\":\"Tesoriere\"}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String generateCertNumber(Long associationId) {
        long count = issuedRepository.countByAssociationId(associationId);
        return String.format("CERT-%d-%04d", LocalDate.now().getYear(), count + 1);
    }

    private List<String> wrapText(String text, int maxCharsPerLine) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isEmpty()) return lines;
        String[] words = text.split("\\s+");
        StringBuilder currentLine = new StringBuilder();
        for (String word : words) {
            if (currentLine.length() + word.length() + 1 > maxCharsPerLine) {
                lines.add(currentLine.toString());
                currentLine = new StringBuilder(word);
            } else {
                if (currentLine.length() > 0) currentLine.append(" ");
                currentLine.append(word);
            }
        }
        if (currentLine.length() > 0) lines.add(currentLine.toString());
        return lines;
    }
}
