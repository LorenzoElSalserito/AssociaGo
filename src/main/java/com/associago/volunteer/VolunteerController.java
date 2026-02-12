package com.associago.volunteer;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/volunteers")
public class VolunteerController {

    private final VolunteerService volunteerService;

    public VolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    @GetMapping
    public ResponseEntity<Iterable<Volunteer>> getAllVolunteers() {
        return ResponseEntity.ok(volunteerService.getAllVolunteers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Volunteer> getVolunteerById(@PathVariable Long id) {
        return volunteerService.getVolunteerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Volunteer> createVolunteer(@RequestBody Volunteer volunteer) {
        return ResponseEntity.ok(volunteerService.createVolunteer(volunteer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Volunteer> updateVolunteer(@PathVariable Long id, @RequestBody Volunteer volunteer) {
        try {
            return ResponseEntity.ok(volunteerService.updateVolunteer(id, volunteer));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVolunteer(@PathVariable Long id) {
        volunteerService.deleteVolunteer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/shifts")
    public ResponseEntity<List<VolunteerShift>> getShiftsByVolunteer(@PathVariable Long id) {
        return ResponseEntity.ok(volunteerService.getShiftsByVolunteer(id));
    }

    @PostMapping("/shifts")
    public ResponseEntity<VolunteerShift> createShift(@RequestBody VolunteerShift shift) {
        return ResponseEntity.ok(volunteerService.createShift(shift));
    }

    @PutMapping("/shifts/{id}")
    public ResponseEntity<VolunteerShift> updateShift(@PathVariable Long id, @RequestBody VolunteerShift shift) {
        try {
            return ResponseEntity.ok(volunteerService.updateShift(id, shift));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Expenses
    @GetMapping("/{id}/expenses")
    public ResponseEntity<List<VolunteerExpense>> getExpensesByVolunteer(@PathVariable Long id) {
        return ResponseEntity.ok(volunteerService.getExpensesByVolunteer(id));
    }

    @PostMapping("/expenses")
    public ResponseEntity<VolunteerExpense> createExpense(@RequestBody VolunteerExpense expense) {
        return ResponseEntity.ok(volunteerService.createExpense(expense));
    }

    @PutMapping("/expenses/{id}/status")
    public ResponseEntity<VolunteerExpense> updateExpenseStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(volunteerService.updateExpenseStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
