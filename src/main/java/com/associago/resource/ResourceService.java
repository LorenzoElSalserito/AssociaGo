package com.associago.resource;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceBookingRepository bookingRepository;

    public ResourceService(ResourceRepository resourceRepository, ResourceBookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    // --- Resources ---

    public List<Resource> getResources(Long associationId) {
        return resourceRepository.findByAssociationId(associationId);
    }

    public Resource getResource(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + id));
    }

    @Transactional
    public Resource saveResource(Resource resource) {
        resource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(resource);
    }

    @Transactional
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    // --- Bookings ---

    public List<ResourceBooking> getBookings(Long associationId) {
        return bookingRepository.findByAssociationId(associationId);
    }

    public List<ResourceBooking> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId);
    }

    public List<ResourceBooking> getBookingsInRange(Long associationId, LocalDateTime start, LocalDateTime end) {
        return bookingRepository.findByAssociationAndDateRange(associationId, start, end);
    }

    @Transactional
    public ResourceBooking createBooking(ResourceBooking booking) {
        // Check for conflicts
        List<ResourceBooking> conflicts = bookingRepository.findConflicts(
                booking.getResourceId(), booking.getStartDatetime(), booking.getEndDatetime());

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Resource is already booked for the requested time slot. " +
                    "Conflicts: " + conflicts.size());
        }

        // Auto-confirm or set pending based on resource
        Resource resource = getResource(booking.getResourceId());
        if (resource.isRequiresApproval()) {
            booking.setStatus("PENDING");
        } else {
            booking.setStatus("CONFIRMED");
        }

        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Transactional
    public ResourceBooking updateBooking(Long id, ResourceBooking details) {
        ResourceBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

        // Check conflicts for the new time if changed
        if (!booking.getStartDatetime().equals(details.getStartDatetime()) ||
            !booking.getEndDatetime().equals(details.getEndDatetime())) {
            List<ResourceBooking> conflicts = bookingRepository.findConflicts(
                    booking.getResourceId(), details.getStartDatetime(), details.getEndDatetime());
            conflicts.removeIf(c -> c.getId().equals(id)); // Exclude self
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("Resource is already booked for the requested time slot.");
            }
        }

        booking.setTitle(details.getTitle());
        booking.setStartDatetime(details.getStartDatetime());
        booking.setEndDatetime(details.getEndDatetime());
        booking.setNotes(details.getNotes());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Transactional
    public ResourceBooking cancelBooking(Long id) {
        ResourceBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Transactional
    public ResourceBooking approveBooking(Long id, Long approvedBy) {
        ResourceBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        booking.setStatus("CONFIRMED");
        booking.setApprovedBy(approvedBy);
        booking.setApprovedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
}
