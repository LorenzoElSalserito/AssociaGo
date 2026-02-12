package com.associago.event;

import com.associago.event.repository.EventParticipantRepository;
import com.associago.event.repository.EventRepository;
import com.associago.notification.NotificationService;
import com.associago.stats.dto.EventStatsDTO;
import com.associago.stats.dto.EventSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final NotificationService notificationService;

    public EventService(EventRepository eventRepository, 
                        EventParticipantRepository participantRepository,
                        NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
        this.notificationService = notificationService;
    }

    // --- CRUD ---

    public Iterable<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    @Transactional
    public Event createEvent(Event event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        if (event.getStatus() == null) event.setStatus("DRAFT");
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long id, Event eventDetails) {
        return eventRepository.findById(id).map(event -> {
            boolean wasCancelled = "CANCELLED".equals(event.getStatus());
            
            event.setName(eventDetails.getName());
            event.setDescription(eventDetails.getDescription());
            event.setType(eventDetails.getType());
            event.setStartDatetime(eventDetails.getStartDatetime());
            event.setEndDatetime(eventDetails.getEndDatetime());
            event.setLocation(eventDetails.getLocation());
            event.setAddress(eventDetails.getAddress());
            event.setMaxParticipants(eventDetails.getMaxParticipants());
            event.setCostMember(eventDetails.getCostMember());
            event.setCostNonMember(eventDetails.getCostNonMember());
            event.setIsPublic(eventDetails.getIsPublic());
            event.setStatus(eventDetails.getStatus());
            event.setRequireRegistration(eventDetails.isRequireRegistration());
            event.setGenerateInvoice(eventDetails.isGenerateInvoice());
            event.setCancellationDate(eventDetails.getCancellationDate());
            event.setCancellationReason(eventDetails.getCancellationReason());
            event.setUpdatedAt(LocalDateTime.now());
            
            Event updatedEvent = eventRepository.save(event);

            // Notify participants if event is cancelled
            if (!wasCancelled && "CANCELLED".equals(updatedEvent.getStatus())) {
                notifyCancellation(updatedEvent);
            }

            return updatedEvent;
        }).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    // --- Participants ---

    public List<EventParticipant> getParticipants(Long eventId) {
        return participantRepository.findByEventId(eventId);
    }

    @Transactional
    public EventParticipant addParticipant(EventParticipant participant) {
        EventParticipant saved = participantRepository.save(participant);
        
        // Notify user of registration
        if (participant.getUser() != null) {
            Event event = eventRepository.findById(participant.getEvent().getId()).orElse(null);
            if (event != null) {
                notificationService.createNotification(
                    participant.getUser().getId(),
                    "Registrazione Evento",
                    "Sei stato registrato all'evento: " + event.getName(),
                    "INFO",
                    "EVENT",
                    event.getId()
                );
            }
        }
        
        return saved;
    }

    @Transactional
    public void removeParticipant(Long participantId) {
        participantRepository.deleteById(participantId);
    }

    // --- Stats ---

    public EventSummaryDTO getEventSummary(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        List<EventParticipant> participants = participantRepository.findByEventId(id);
        
        EventSummaryDTO summary = new EventSummaryDTO();
        summary.setEvent(event);
        summary.setRegisteredParticipants(participants.size());
        
        // Simple revenue calculation (assuming paid status)
        // Ideally check payment status
        // BigDecimal revenue = participants.stream().map(EventParticipant::getAmountPaid).reduce(BigDecimal.ZERO, BigDecimal::add);
        // summary.setTotalRevenue(revenue);

        return summary;
    }

    public EventStatsDTO getGlobalEventStats() {
        // Placeholder
        return new EventStatsDTO();
    }
    
    // --- Notifications ---
    
    private void notifyCancellation(Event event) {
        List<EventParticipant> participants = participantRepository.findByEventId(event.getId());
        for (EventParticipant p : participants) {
            if (p.getUser() != null) {
                notificationService.createNotification(
                    p.getUser().getId(),
                    "Evento Cancellato",
                    "L'evento '" + event.getName() + "' è stato cancellato. Motivo: " + (event.getCancellationReason() != null ? event.getCancellationReason() : "N/D"),
                    "ALERT",
                    "EVENT",
                    event.getId()
                );
            }
        }
    }
}
