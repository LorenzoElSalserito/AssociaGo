package com.associago.communication;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.membership.MembershipService;
import com.associago.membership.UserAssociation;
import com.associago.user.User;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.List;

@Service
public class CommunicationService {

    private final CommunicationRepository communicationRepository;
    private final CommunicationTemplateRepository templateRepository;
    private final CommunicationRecipientRepository recipientRepository;
    private final MembershipService membershipService;
    private final AssociationService associationService;
    private final JavaMailSender mailSender;

    public CommunicationService(CommunicationRepository communicationRepository,
                                CommunicationTemplateRepository templateRepository,
                                CommunicationRecipientRepository recipientRepository,
                                MembershipService membershipService,
                                AssociationService associationService,
                                JavaMailSender mailSender) {
        this.communicationRepository = communicationRepository;
        this.templateRepository = templateRepository;
        this.recipientRepository = recipientRepository;
        this.membershipService = membershipService;
        this.associationService = associationService;
        this.mailSender = mailSender;
    }

    // --- Templates ---

    public List<CommunicationTemplate> getTemplates(Long associationId) {
        return templateRepository.findByAssociationId(associationId);
    }

    @Transactional
    public CommunicationTemplate saveTemplate(CommunicationTemplate template) {
        template.setUpdatedAt(LocalDateTime.now());
        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }

    // --- Communications ---

    public List<Communication> getCommunications(Long associationId) {
        return communicationRepository.findByAssociationIdOrderByCreatedAtDesc(associationId);
    }

    public Communication getById(Long id) {
        return communicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Communication not found: " + id));
    }

    @Transactional
    public Communication create(Communication communication) {
        communication.setUpdatedAt(LocalDateTime.now());
        return communicationRepository.save(communication);
    }

    @Transactional
    public Communication update(Long id, Communication details) {
        Communication comm = getById(id);
        comm.setSubject(details.getSubject());
        comm.setBodyHtml(details.getBodyHtml());
        comm.setBodyText(details.getBodyText());
        comm.setSenderEmail(details.getSenderEmail());
        comm.setSenderName(details.getSenderName());
        comm.setSegmentFilter(details.getSegmentFilter());
        comm.setNotes(details.getNotes());
        comm.setUpdatedAt(LocalDateTime.now());
        return communicationRepository.save(comm);
    }

    @Transactional
    public void delete(Long id) {
        communicationRepository.deleteById(id);
    }

    /**
     * Resolves recipients from segment filter and persists them.
     */
    @Transactional
    public List<CommunicationRecipient> resolveRecipients(Long communicationId) {
        Communication comm = getById(communicationId);
        // Resolving again replaces the previous list instead of appending duplicates.
        recipientRepository.deleteAll(recipientRepository.findByCommunicationId(communicationId));
        List<CommunicationRecipient> recipients = new ArrayList<>();

        // Recipients are this association's members (Soci), one message per email address.
        Set<String> seen = new HashSet<>();
        for (UserAssociation membership : membershipService.findByAssociationId(comm.getAssociationId())) {
            User user = membership.getUser();
            if (user == null || user.getEmail() == null || user.getEmail().isBlank()) continue;
            if (!matchesSegment(membership, comm.getSegmentFilter())) continue;
            if (!seen.add(user.getEmail().trim().toLowerCase())) continue;
            CommunicationRecipient recipient = new CommunicationRecipient();
            recipient.setCommunicationId(communicationId);
            recipient.setUserId(user.getId());
            recipient.setEmail(user.getEmail().trim());
            recipient.setName(user.getFirstName() + " " + user.getLastName());
            recipients.add(recipient);
        }

        recipientRepository.saveAll(recipients);
        comm.setTotalRecipients(recipients.size());
        communicationRepository.save(comm);
        return recipients;
    }

    /**
     * Sends the communication to all resolved recipients via SMTP.
     */
    @Transactional
    public Communication send(Long communicationId, Long sentBy) {
        Communication comm = getById(communicationId);
        List<CommunicationRecipient> recipients = recipientRepository.findByCommunicationId(communicationId);

        if (recipients.isEmpty()) {
            recipients = resolveRecipients(communicationId);
        }

        comm.setStatus("SENDING");
        comm.setSentBy(sentBy);
        communicationRepository.save(comm);

        int delivered = 0;
        int failed = 0;

        Association association = associationService.findById(comm.getAssociationId()).orElse(new Association());

        for (CommunicationRecipient recipient : recipients) {
            try {
                // The editor fills bodyHtml; bodyText is optional and often an empty string.
                String body = comm.getBodyText() != null && !comm.getBodyText().isBlank() ? comm.getBodyText() : comm.getBodyHtml();
                String personalizedBody = mergeBody(body != null ? body : "", recipient.getName(), association.getName());

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(comm.getSenderEmail() != null ? comm.getSenderEmail() : "noreply@associago.local");
                message.setTo(recipient.getEmail());
                message.setSubject(comm.getSubject());
                message.setText(htmlToText(personalizedBody));

                mailSender.send(message);
                recipient.setStatus("SENT");
                recipient.setSentAt(LocalDateTime.now());
                delivered++;
            } catch (Exception e) {
                recipient.setStatus("FAILED");
                recipient.setErrorMessage(e.getMessage());
                failed++;
            }
        }

        recipientRepository.saveAll(recipients);
        comm.setDeliveredCount(delivered);
        comm.setFailedCount(failed);
        comm.setStatus(delivered == 0 && failed > 0 ? "FAILED" : "SENT");
        comm.setSentAt(LocalDateTime.now());
        return communicationRepository.save(comm);
    }

    public List<CommunicationRecipient> getRecipients(Long communicationId) {
        return recipientRepository.findByCommunicationId(communicationId);
    }

    // --- Helpers ---

    private boolean matchesSegment(UserAssociation membership, String segmentFilterJson) {
        if (segmentFilterJson == null || segmentFilterJson.isEmpty()) return true;
        // Simple segment matching: check if member status matches
        String filter = segmentFilterJson.toLowerCase();
        if (filter.contains("active") && !"ACTIVE".equalsIgnoreCase(membership.getStatus())) {
            return false;
        }
        return true;
    }

    private String mergeBody(String body, String recipientName, String associationName) {
        if (body == null) return "";
        body = body.replace("{{name}}", recipientName != null ? recipientName : "");
        body = body.replace("{{associationName}}", associationName != null ? associationName : "");
        return body;
    }

    /** Plain-text rendering that keeps paragraph and line breaks of the HTML editor. */
    static String htmlToText(String html) {
        String text = html.replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("(?i)</(p|div|li|h[1-6])>", "\n")
                .replaceAll("<[^>]*>", "")
                .replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'").replace("&amp;", "&");
        return text.replaceAll("\n{3,}", "\n\n").strip();
    }
}
