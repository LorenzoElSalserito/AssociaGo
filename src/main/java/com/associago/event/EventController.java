package com.associago.event;

import com.associago.stats.dto.EventStatsDTO;
import com.associago.stats.dto.EventSummaryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // --- CRUD ---

    @GetMapping
    public ResponseEntity<Iterable<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        try {
            return ResponseEntity.ok(eventService.updateEvent(id, event));
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
    public ResponseEntity<EventParticipant> addParticipant(@PathVariable Long id, @RequestBody EventParticipant participant) {
        participant.setEvent(eventService.getEventById(id).orElseThrow());
        return ResponseEntity.ok(eventService.addParticipant(participant));
    }

    @DeleteMapping("/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long participantId) {
        eventService.removeParticipant(participantId);
        return ResponseEntity.noContent().build();
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
