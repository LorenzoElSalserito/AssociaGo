package com.associago.event;

import com.associago.coupon.Coupon;
import com.associago.coupon.CouponService;
import com.associago.event.repository.EventParticipantRepository;
import com.associago.event.repository.EventRepository;
import com.associago.notification.NotificationService;
import com.associago.stats.dto.EventStatsDTO;
import com.associago.stats.dto.EventSummaryDTO;
import com.associago.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final NotificationService notificationService;
    private final CouponService couponService;

    public EventService(EventRepository eventRepository, 
                        EventParticipantRepository participantRepository,
                        NotificationService notificationService,
                        CouponService couponService) {
        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
        this.notificationService = notificationService;
        this.couponService = couponService;
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
        return addParticipant(participant, null);
    }

    /** fallbackAssociationId resolves coupon codes for legacy events saved without an association. */
    @Transactional
    public EventParticipant addParticipant(EventParticipant participant, Long fallbackAssociationId) {
        if (participant.getId() == null && participant.getEvent() != null) applyPricing(participant, fallbackAssociationId);
        EventParticipant saved = participantRepository.save(participant);
        
        Event event = participant.getEvent() == null ? null
                : eventRepository.findById(participant.getEvent().getId()).orElse(null);
        if (event != null) {
            User user = participant.getUser();
            String name = user != null ? fullName(user) : participant.getGuestName();
            notificationService.notifyAssociation(
                event.getAssociationId(),
                user != null ? user.getId() : null,
                "notifications.messages.eventRegistration",
                Map.of("event", nz(event.getName()), "name", nz(name)),
                "INFO",
                "EVENT",
                event.getId()
            );
        }
        
        return saved;
    }

    /** Server-side pricing: members pay the member cost, guests the non-member cost, minus any re-validated coupon. */
    private void applyPricing(EventParticipant participant, Long fallbackAssociationId) {
        Event event = eventRepository.findById(participant.getEvent().getId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        boolean member = participant.getUser() != null;
        BigDecimal base = CouponService.eventPrice(event, member);
        String code = participant.getCouponCode() != null ? participant.getCouponCode().trim() : "";
        participant.setOriginalAmount(base);
        participant.setCouponId(null);
        participant.setCouponCode(null);
        participant.setDiscountAmount(BigDecimal.ZERO);
        participant.setAmountDue(base);
        if (code.isEmpty()) return;

        CouponService.CouponQuote quote = couponService.quoteForEvent(event.getId(), code, member, fallbackAssociationId);
        Coupon coupon = quote.coupon();
        couponService.redeem(coupon.getId());
        participant.setCouponId(coupon.getId());
        participant.setCouponCode(coupon.getCode());
        participant.setDiscountAmount(quote.discount());
        participant.setAmountDue(quote.finalAmount());
    }

    // Coupon uses are not given back on removal: the counter records redemptions.
    @Transactional
    public void removeParticipant(Long participantId) {
        participantRepository.deleteById(participantId);
    }

    private static final Set<String> PAYMENT_STATUSES = Set.of("PAID", "PENDING", "WAIVED", "REFUNDED");

    @Transactional
    public EventParticipant checkInParticipant(Long eventId, Long participantId) {
        EventParticipant p = findEventParticipant(eventId, participantId);
        if ("CANCELLED".equals(p.getStatus())) {
            throw new IllegalArgumentException("Cancelled participants cannot check in");
        }
        p.setStatus("CHECKED_IN");
        p.setCheckInTime(LocalDateTime.now());
        return participantRepository.save(p);
    }

    @Transactional
    public EventParticipant undoCheckIn(Long eventId, Long participantId) {
        EventParticipant p = findEventParticipant(eventId, participantId);
        if ("CHECKED_IN".equals(p.getStatus())) {
            p.setStatus("REGISTERED");
        }
        p.setCheckInTime(null);
        return participantRepository.save(p);
    }

    @Transactional
    public EventParticipant updatePaymentStatus(Long eventId, Long participantId, String paymentStatus) {
        if (paymentStatus == null || !PAYMENT_STATUSES.contains(paymentStatus)) {
            throw new IllegalArgumentException("Invalid payment status: " + paymentStatus);
        }
        EventParticipant p = findEventParticipant(eventId, participantId);
        p.setPaymentStatus(paymentStatus);
        if ("PAID".equals(paymentStatus) && p.getPaymentDate() == null) {
            p.setPaymentDate(LocalDate.now());
        }
        return participantRepository.save(p);
    }

    private EventParticipant findEventParticipant(Long eventId, Long participantId) {
        return participantRepository.findById(participantId)
                .filter(p -> p.getEvent() != null && Objects.equals(p.getEvent().getId(), eventId))
                .orElseThrow(() -> new EntityNotFoundException("Participant not found for this event"));
    }

    /** Recorded payment, or the (discounted) amount due for participants marked as paid. */
    private static BigDecimal collectedAmount(EventParticipant p) {
        if (p.getAmountPaid() != null && p.getAmountPaid().signum() > 0) return p.getAmountPaid();
        return "PAID".equals(p.getPaymentStatus()) ? p.getAmountDue() : null;
    }

    private static boolean isActiveParticipant(EventParticipant p) {
        String status = p.getStatus();
        return !"CANCELLED".equals(status) && !"WAITLIST".equals(status) && !"WAITLISTED".equals(status);
    }

    // --- Stats ---

    public EventSummaryDTO getEventSummary(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        List<EventParticipant> allParticipants = participantRepository.findByEventId(id);
        List<EventParticipant> participants = allParticipants.stream()
                .filter(EventService::isActiveParticipant)
                .toList();
        
        EventSummaryDTO summary = new EventSummaryDTO();
        summary.setEvent(event);
        summary.setRegisteredParticipants(participants.size());
        
        summary.setCheckedInParticipants((int) participants.stream()
                .filter(p -> "CHECKED_IN".equals(p.getStatus()) || p.getCheckInTime() != null).count());

        BigDecimal revenue = allParticipants.stream()
                .map(EventService::collectedAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalRevenue(revenue);

        summary.setAttendanceRate(summary.getRegisteredParticipants() > 0
                ? (double) summary.getCheckedInParticipants() / summary.getRegisteredParticipants() * 100
                : 0.0);

        return summary;
    }

    public EventStatsDTO getGlobalEventStats() {
        // Placeholder
        return new EventStatsDTO();
    }
    
    // --- Notifications ---
    
    private void notifyCancellation(Event event) {
        int participants = participantRepository.findByEventId(event.getId()).size();
        notificationService.notifyAssociation(
            event.getAssociationId(),
            null,
            "notifications.messages.eventCancelled",
            Map.of("event", nz(event.getName()), "reason", nz(event.getCancellationReason()), "count", participants),
            "ALERT",
            "EVENT",
            event.getId()
        );
    }

    private static String fullName(User user) {
        return (nz(user.getFirstName()) + " " + nz(user.getLastName())).trim();
    }

    private static String nz(String value) {
        return value == null ? "" : value;
    }
}
