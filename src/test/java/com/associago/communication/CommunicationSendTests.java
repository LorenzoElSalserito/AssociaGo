package com.associago.communication;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.membership.MembershipService;
import com.associago.membership.UserAssociation;
import com.associago.user.User;
import com.associago.user.UserService;
import java.time.LocalDate;
import java.io.File;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

@SpringBootTest
class CommunicationSendTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired private CommunicationService communicationService;
    @Autowired private CommunicationRecipientRepository recipientRepository;
    @Autowired private AssociationService associationService;
    @Autowired private UserService userService;
    @Autowired private MembershipService membershipService;
    @MockitoBean private JavaMailSender mailSender;

    @Test
    void resolvingTwiceKeepsOneRecipientPerMemberAndHtmlBodyIsSent() {
        String marker = "mail-" + UUID.randomUUID().toString().substring(0, 8) + "@example.invalid";
        Association association = new Association();
        association.setName("Posta " + marker);
        association.setSlug(marker.substring(0, 13));
        association.setEmail(marker);
        association.setPassword("mail-password");
        association.setType("APS");
        association = associationService.create(association);
        Association other = new Association();
        other.setName("Altra " + marker);
        other.setSlug("o" + marker.substring(0, 13));
        other.setEmail("o" + marker);
        other.setPassword("mail-password");
        other.setType("APS");
        other = associationService.create(other);
        enrol(association, user("Lucia", marker));
        // Same address enrolled twice must still receive one message; other associations are excluded.
        enrol(association, user("Lucia", marker.toUpperCase()));
        enrol(other, user("Estranea", "x" + marker));

        Communication draft = new Communication();
        draft.setAssociationId(association.getId());
        draft.setSubject("Convocazione");
        // The renderer always sends an empty bodyText next to the HTML body.
        draft.setBodyText("");
        draft.setBodyHtml("<p>Ciao {{name}},</p><p>assemblea &amp; cena<br>alle 18</p>");
        draft.setStatus("DRAFT");
        Communication comm = communicationService.create(draft);

        communicationService.resolveRecipients(comm.getId());
        communicationService.resolveRecipients(comm.getId());
        List<CommunicationRecipient> recipients = recipientRepository.findByCommunicationId(comm.getId());
        assertThat(recipients).extracting(CommunicationRecipient::getEmail).containsExactly(marker);

        Communication sent = communicationService.send(comm.getId(), null);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, atLeastOnce()).send(captor.capture());
        SimpleMailMessage message = captor.getAllValues().stream()
                .filter(m -> marker.equals(m.getTo()[0])).findFirst().orElseThrow();
        assertThat(message.getText()).contains("Ciao Lucia Posta,").contains("assemblea & cena\nalle 18").doesNotContain("<p>");
        assertThat(sent.getStatus()).isEqualTo("SENT");
        assertThat(sent.getDeliveredCount()).isEqualTo(recipients.size());
    }

    @Test
    void htmlToTextKeepsBreaksAndDecodesEntities() {
        assertThat(CommunicationService.htmlToText("<h1>T</h1><div>a&nbsp;b</div><ul><li>x</li><li>y</li></ul>"))
                .isEqualTo("T\na b\nx\ny");
        assertThat(CommunicationService.htmlToText("")).isEmpty();
        verify(mailSender, org.mockito.Mockito.never()).send(any(SimpleMailMessage.class));
    }

    private User user(String firstName, String email) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName("Posta");
        user.setEmail(email);
        return userService.save(user);
    }

    private void enrol(Association association, User user) {
        UserAssociation membership = new UserAssociation();
        membership.setAssociation(association);
        membership.setUser(user);
        membership.setRole("MEMBER");
        membership.setStatus("ACTIVE");
        membership.setJoinDate(LocalDate.now());
        membershipService.save(membership);
    }
}
