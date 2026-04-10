package com.associago.volunteer;

import com.associago.volunteer.dto.VolunteerCreateDTO;
import com.associago.volunteer.dto.VolunteerDTO;
import com.associago.volunteer.mapper.VolunteerMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/v1/volunteers")
public class VolunteerController {

    private final VolunteerService volunteerService;

    public VolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    @GetMapping
    public ResponseEntity<List<VolunteerDTO>> getAllVolunteers() {
        List<VolunteerDTO> volunteers = StreamSupport.stream(volunteerService.getAllVolunteers().spliterator(), false)
                .map(VolunteerMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(volunteers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VolunteerDTO> getVolunteerById(@PathVariable Long id) {
        return volunteerService.getVolunteerById(id)
                .map(VolunteerMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VolunteerDTO> createVolunteer(@Valid @RequestBody VolunteerCreateDTO dto) {
        Volunteer volunteer = VolunteerMapper.toEntity(dto);
        Volunteer saved = volunteerService.createVolunteer(volunteer);
        return ResponseEntity.ok(VolunteerMapper.toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VolunteerDTO> updateVolunteer(@PathVariable Long id,
                                                         @Valid @RequestBody VolunteerCreateDTO dto) {
        return volunteerService.getVolunteerById(id)
                .map(existing -> {
                    VolunteerMapper.updateEntity(existing, dto);
                    Volunteer saved = volunteerService.updateVolunteer(id, existing);
                    return ResponseEntity.ok(VolunteerMapper.toDTO(saved));
                })
                .orElse(ResponseEntity.notFound().build());
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
