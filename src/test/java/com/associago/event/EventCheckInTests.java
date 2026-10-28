package com.associago.event;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.stats.dto.EventSummaryDTO;
import jakarta.persistence.EntityNotFoundException;
import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class EventCheckInTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired private EventService eventService;
    @Autowired private AssociationService associationService;

    @Test
    void checkInUndoAndSummaryExcludeCancelled() {
        Event event = event();
        EventParticipant anna = guest(event, "Anna", "REGISTERED");
        EventParticipant bruno = guest(event, "Bruno", "REGISTERED");
        guest(event, "Carla", "REGISTERED");
        EventParticipant dario = guest(event, "Dario", "CANCELLED");

        EventParticipant checked = eventService.checkInParticipant(event.getId(), anna.getId());
        assertThat(checked.getStatus()).isEqualTo("CHECKED_IN");
        assertThat(checked.getCheckInTime()).isNotNull();
        eventService.checkInParticipant(event.getId(), bruno.getId());

        EventSummaryDTO summary = eventService.getEventSummary(event.getId());
        assertThat(summary.getRegisteredParticipants()).isEqualTo(3);
        assertThat(summary.getCheckedInParticipants()).isEqualTo(2);
        assertThat(summary.getAttendanceRate()).isCloseTo(66.67, org.assertj.core.data.Offset.offset(0.01));

        EventParticipant undone = eventService.undoCheckIn(event.getId(), bruno.getId());
        assertThat(undone.getStatus()).isEqualTo("REGISTERED");
        assertThat(undone.getCheckInTime()).isNull();
        summary = eventService.getEventSummary(event.getId());
        assertThat(summary.getCheckedInParticipants()).isEqualTo(1);

        assertThatThrownBy(() -> eventService.checkInParticipant(event.getId(), dario.getId()))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(eventService.getEventSummary(event.getId()).getCheckedInParticipants()).isEqualTo(1);

        Event other = event();
        assertThatThrownBy(() -> eventService.checkInParticipant(other.getId(), anna.getId()))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void paymentStatusIsValidated() {
        Event event = event();
        EventParticipant p = guest(event, "Elena", "REGISTERED");

        EventParticipant paid = eventService.updatePaymentStatus(event.getId(), p.getId(), "PAID");
        assertThat(paid.getPaymentStatus()).isEqualTo("PAID");
        assertThat(paid.getPaymentDate()).isNotNull();
        assertThat(eventService.updatePaymentStatus(event.getId(), p.getId(), "WAIVED").getPaymentStatus())
                .isEqualTo("WAIVED");
        assertThatThrownBy(() -> eventService.updatePaymentStatus(event.getId(), p.getId(), "BOGUS"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private Event event() {
        String marker = UUID.randomUUID().toString().substring(0, 8);
        Association association = new Association();
        association.setName("Eventi " + marker);
        association.setSlug("ev" + marker);
        association.setEmail("ev-" + marker + "@example.invalid");
        association.setPassword("event-password");
        association.setType("APS");
        association = associationService.create(association);

        Event event = new Event();
        event.setAssociationId(association.getId());
        event.setName("Cena " + marker);
        event.setType("SOCIAL");
        event.setStartDatetime(LocalDateTime.now().plusDays(1));
        event.setCostMember(BigDecimal.ZERO);
        return eventService.createEvent(event);
    }

    private EventParticipant guest(Event event, String name, String status) {
        EventParticipant p = new EventParticipant();
        p.setEvent(event);
        p.setGuestName(name);
        p.setStatus(status);
        return eventService.addParticipant(p);
    }
}
