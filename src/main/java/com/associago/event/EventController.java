package com.associago.event;

import com.associago.event.dto.EventCreateDTO;
import com.associago.event.dto.EventDTO;
import com.associago.event.mapper.EventMapper;
import com.associago.stats.dto.EventStatsDTO;
import com.associago.stats.dto.EventSummaryDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // --- CRUD ---

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        List<EventDTO> events = StreamSupport.stream(eventService.getAllEvents().spliterator(), false)
                .map(EventMapper::toDTO)
                .toList();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(EventMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@Valid @RequestBody EventCreateDTO dto) {
        Event entity = EventMapper.toEntity(dto);
        Event saved = eventService.createEvent(entity);
        return ResponseEntity.ok(EventMapper.toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @Valid @RequestBody EventCreateDTO dto) {
        try {
            Event entity = EventMapper.toEntity(dto);
            Event updated = eventService.updateEvent(id, entity);
            return ResponseEntity.ok(EventMapper.toDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // --- Participants ---

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<EventParticipant>> getParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getParticipants(id));
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<EventParticipant> addParticipant(@PathVariable Long id, @RequestBody EventParticipant participant,
            @RequestHeader(value = "X-Association-Id", required = false) Long associationId) {
        participant.setEvent(eventService.getEventById(id).orElseThrow());
        return ResponseEntity.ok(eventService.addParticipant(participant, associationId));
    }

    @DeleteMapping("/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long participantId) {
        eventService.removeParticipant(participantId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/participants/{participantId}/check-in")
    public ResponseEntity<EventParticipant> checkIn(@PathVariable Long id, @PathVariable Long participantId) {
        return ResponseEntity.ok(eventService.checkInParticipant(id, participantId));
    }

    @DeleteMapping("/{id}/participants/{participantId}/check-in")
    public ResponseEntity<EventParticipant> undoCheckIn(@PathVariable Long id, @PathVariable Long participantId) {
        return ResponseEntity.ok(eventService.undoCheckIn(id, participantId));
    }

    @PutMapping("/{id}/participants/{participantId}/payment-status")
    public ResponseEntity<EventParticipant> updatePaymentStatus(@PathVariable Long id, @PathVariable Long participantId,
                                                                @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(eventService.updatePaymentStatus(id, participantId, body.get("paymentStatus")));
    }

    // --- Stats ---

    @GetMapping("/{id}/summary")
    public ResponseEntity<EventSummaryDTO> getEventSummary(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventService.getEventSummary(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats/global")
    public ResponseEntity<EventStatsDTO> getGlobalStats() {
        return ResponseEntity.ok(eventService.getGlobalEventStats());
    }
}
