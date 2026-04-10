package com.associago.communication;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.member.Member;
import com.associago.member.MemberService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CommunicationService {

    private final CommunicationRepository communicationRepository;
    private final CommunicationTemplateRepository templateRepository;
    private final CommunicationRecipientRepository recipientRepository;
    private final MemberService memberService;
    private final AssociationService associationService;
    private final JavaMailSender mailSender;

    public CommunicationService(CommunicationRepository communicationRepository,
                                CommunicationTemplateRepository templateRepository,
                                CommunicationRecipientRepository recipientRepository,
                                MemberService memberService,
                                AssociationService associationService,
                                JavaMailSender mailSender) {
        this.communicationRepository = communicationRepository;
        this.templateRepository = templateRepository;
        this.recipientRepository = recipientRepository;
        this.memberService = memberService;
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
        List<CommunicationRecipient> recipients = new ArrayList<>();

        // Get all members and filter by segment
        Iterable<Member> allMembers = memberService.getAllMembers();
        for (Member member : allMembers) {
            if (member.getEmail() != null && !member.getEmail().isEmpty()) {
                if (matchesSegment(member, comm.getSegmentFilter())) {
                    CommunicationRecipient recipient = new CommunicationRecipient();
                    recipient.setCommunicationId(communicationId);
                    recipient.setUserId(member.getId());
                    recipient.setEmail(member.getEmail());
                    recipient.setName(member.getFirstName() + " " + member.getLastName());
                    recipients.add(recipient);
                }
            }
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
                String personalizedBody = mergeBody(comm.getBodyText() != null ? comm.getBodyText() : comm.getBodyHtml(),
                        recipient.getName(), association.getName());

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(comm.getSenderEmail() != null ? comm.getSenderEmail() : "noreply@associago.local");
                message.setTo(recipient.getEmail());
                message.setSubject(comm.getSubject());
                message.setText(personalizedBody.replaceAll("<[^>]*>", "")); // Strip HTML for plain text

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
        comm.setStatus("SENT");
        comm.setSentAt(LocalDateTime.now());
        return communicationRepository.save(comm);
    }

    public List<CommunicationRecipient> getRecipients(Long communicationId) {
        return recipientRepository.findByCommunicationId(communicationId);
    }

    // --- Helpers ---

    private boolean matchesSegment(Member member, String segmentFilterJson) {
        if (segmentFilterJson == null || segmentFilterJson.isEmpty()) return true;
        // Simple segment matching: check if member status matches
        String filter = segmentFilterJson.toLowerCase();
        if (filter.contains("active") && !"ACTIVE".equalsIgnoreCase(member.getMembershipStatus())) {
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
}
