package com.associago.resource;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // --- Resources ---

    @GetMapping
    public List<Resource> getResources(@RequestParam Long associationId) {
        return resourceService.getResources(associationId);
    }

    @GetMapping("/{id}")
    public Resource getResource(@PathVariable Long id) {
        return resourceService.getResource(id);
    }

    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.saveResource(resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable Long id, @RequestBody Resource resource) {
        resource.setId(id);
        return resourceService.saveResource(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // --- Bookings ---

    @GetMapping("/bookings")
    public List<ResourceBooking> getBookings(@RequestParam Long associationId) {
        return resourceService.getBookings(associationId);
    }

    @GetMapping("/bookings/calendar")
    public List<ResourceBooking> getBookingsCalendar(
            @RequestParam Long associationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return resourceService.getBookingsInRange(associationId, start, end);
    }

    @GetMapping("/{resourceId}/bookings")
    public List<ResourceBooking> getResourceBookings(@PathVariable Long resourceId) {
        return resourceService.getBookingsByResource(resourceId);
    }

    @PostMapping("/bookings")
    public ResponseEntity<ResourceBooking> createBooking(@RequestBody ResourceBooking booking) {
        try {
            return ResponseEntity.ok(resourceService.createBooking(booking));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<ResourceBooking> updateBooking(@PathVariable Long id, @RequestBody ResourceBooking booking) {
        try {
            return ResponseEntity.ok(resourceService.updateBooking(id, booking));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/bookings/{id}/cancel")
    public ResourceBooking cancelBooking(@PathVariable Long id) {
        return resourceService.cancelBooking(id);
    }

    @PostMapping("/bookings/{id}/approve")
    public ResourceBooking approveBooking(@PathVariable Long id, @RequestParam Long approvedBy) {
        return resourceService.approveBooking(id, approvedBy);
    }
}
