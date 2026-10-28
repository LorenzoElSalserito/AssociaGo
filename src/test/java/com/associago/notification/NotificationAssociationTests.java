package com.associago.notification;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.event.Event;
import com.associago.event.EventParticipant;
import com.associago.event.EventService;
import com.associago.membership.MembershipService;
import com.associago.membership.UserAssociation;
import com.associago.user.User;
import com.associago.user.UserService;
import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class NotificationAssociationTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired private NotificationService notificationService;
    @Autowired private NotificationController notificationController;
    @Autowired private AssociationService associationService;
    @Autowired private UserService userService;
    @Autowired private MembershipService membershipService;
    @Autowired private EventService eventService;

    @Test
    void eventRegistrationAndRenewalReachOnlyTheirAssociationBell() {
        Association association = association("Campana");
        Association other = association("Altra");
        User user = user("Giulia");
        UserAssociation membership = enrol(association, user);

        Event event = new Event();
        event.setAssociationId(association.getId());
        event.setName("Cena sociale");
        event.setStartDatetime(LocalDateTime.now().plusDays(3));
        event = eventService.createEvent(event);
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        eventService.addParticipant(participant);
        membershipService.renewMembership(membership.getId(), LocalDate.now().plusYears(1));

        List<Notification> list = notificationService.getAssociationNotifications(association.getId(), null);
        assertThat(list).hasSize(2);
        Notification renewal = list.get(0);
        assertThat(renewal.getMessageKey()).isEqualTo("notifications.messages.membershipRenewed");
        assertThat(renewal.getRelatedEntityType()).isEqualTo("MEMBERSHIP");
        assertThat(renewal.getRelatedEntityId()).isEqualTo(membership.getId());
        assertThat(renewal.getUserId()).isEqualTo(user.getId());
        assertThat(renewal.getMessageParams()).contains("Giulia");
        Notification registration = list.get(1);
        assertThat(registration.getMessageKey()).isEqualTo("notifications.messages.eventRegistration");
        assertThat(registration.getRelatedEntityId()).isEqualTo(event.getId());
        assertThat(registration.getMessageParams()).contains("Cena sociale");
        assertThat(notificationService.countUnread(association.getId())).isEqualTo(2);

        assertThat(notificationService.getAssociationNotifications(other.getId(), null)).isEmpty();
        assertThat(notificationController.markAsRead(registration.getId(), other.getId()).getStatusCode().value()).isEqualTo(404);
        assertThat(notificationService.markAllAsReadForAssociation(other.getId())).isZero();
        assertThat(notificationService.countUnread(association.getId())).isEqualTo(2);

        assertThat(notificationController.markAsRead(registration.getId(), association.getId()).getStatusCode().value()).isEqualTo(200);
        assertThat(notificationService.countUnread(association.getId())).isEqualTo(1);
        assertThat(notificationService.markAllAsReadForAssociation(association.getId())).isEqualTo(1);
        assertThat(notificationService.countUnread(association.getId())).isZero();
        assertThat(notificationService.getAssociationNotifications(association.getId(), null)).allMatch(Notification::isRead);
    }

    @Test
    void guestRegistrationIsNotifiedWithoutMember() {
        Association association = association("Ospiti");
        Event event = new Event();
        event.setAssociationId(association.getId());
        event.setName("Concerto");
        event.setStartDatetime(LocalDateTime.now().plusDays(1));
        event = eventService.createEvent(event);
        EventParticipant guest = new EventParticipant();
        guest.setEvent(event);
        guest.setGuestName("Ospite Esterno");
        eventService.addParticipant(guest);

        List<Notification> list = notificationService.getAssociationNotifications(association.getId(), 1);
        assertThat(list).singleElement().satisfies(n -> {
            assertThat(n.getUserId()).isNull();
            assertThat(n.getMessageParams()).contains("Ospite Esterno");
        });
    }

    private Association association(String prefix) {
        String marker = UUID.randomUUID().toString().substring(0, 8);
        Association association = new Association();
        association.setName(prefix + " " + marker);
        association.setSlug(prefix.toLowerCase() + "-" + marker);
        association.setEmail(prefix.toLowerCase() + "-" + marker + "@example.invalid");
        association.setPassword("bell-password");
        association.setType("APS");
        return associationService.create(association);
    }

    private User user(String firstName) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName("Campanella");
        user.setEmail(firstName.toLowerCase() + "-" + UUID.randomUUID().toString().substring(0, 8) + "@example.invalid");
        return userService.save(user);
    }

    private UserAssociation enrol(Association association, User user) {
        UserAssociation membership = new UserAssociation();
        membership.setAssociation(association);
        membership.setUser(user);
        membership.setRole("MEMBER");
        membership.setStatus("ACTIVE");
        membership.setJoinDate(LocalDate.now());
        return membershipService.save(membership);
    }
}
