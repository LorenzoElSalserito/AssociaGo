package com.associago.certificate;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.event.Event;
import com.associago.event.EventParticipant;
import com.associago.event.EventService;
import com.associago.user.User;
import com.associago.user.UserService;
import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CertificateBatchIssueTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired private CertificateService certificateService;
    @Autowired private AssociationService associationService;
    @Autowired private EventService eventService;
    @Autowired private UserService userService;

    @Test
    void batchIssueTargetsParticipantUsersAndSkipsGuests() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Association association = new Association();
        association.setName("Batch " + suffix);
        association.setSlug("batch-" + suffix);
        association.setEmail(suffix + "@example.invalid");
        association.setPassword("batch-password");
        association.setType("APS");
        association = associationService.create(association);

        // Pad the users table so user and participant ids cannot coincide by accident.
        for (int i = 0; i < 3; i++) user("Pad" + i, "PAD" + suffix + i);

        Event event = new Event();
        event.setAssociationId(association.getId());
        event.setName("Evento batch");
        event.setType("SOCIAL");
        event.setStatus("PLANNED");
        event.setStartDatetime(LocalDateTime.now().plusDays(1));
        Event saved = eventService.createEvent(event);

        User giulia = user("Giulia", "GIULIA" + suffix);
        User marco = user("Marco", "MARCO" + suffix);
        eventService.addParticipant(participant(saved, giulia));
        eventService.addParticipant(participant(saved, marco));
        EventParticipant guest = new EventParticipant();
        guest.setEvent(saved);
        guest.setGuestName("Ospite");
        eventService.addParticipant(guest);

        CertificateTemplate template = new CertificateTemplate();
        template.setAssociationId(association.getId());
        template.setName("Partecipazione");
        template.setType("PARTICIPATION");
        template.setBodyHtml("<p>{{firstName}} {{lastName}}</p>");
        template = certificateService.saveTemplate(template);

        List<IssuedCertificate> issued = certificateService.batchIssueForEvent(template.getId(), saved.getId(), association.getId(), null);

        assertThat(issued).extracting(IssuedCertificate::getUserId).containsExactlyInAnyOrder(giulia.getId(), marco.getId());
        assertThat(issued).allSatisfy(cert -> assertThat(cert.getEventId()).isEqualTo(saved.getId()));
        assertThat(issued).filteredOn(cert -> cert.getUserId().equals(giulia.getId()))
                .singleElement().satisfies(cert -> assertThat(cert.getBodySnapshot()).contains("Giulia"));
    }

    private User user(String firstName, String taxCode) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName("Test");
        user.setTaxCode(taxCode);
        return userService.save(user);
    }

    private static EventParticipant participant(Event event, User user) {
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        return participant;
    }
}
