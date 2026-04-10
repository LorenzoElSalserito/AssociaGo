package com.associago.activity;

import com.associago.activity.dto.ActivityCreateDTO;
import com.associago.activity.dto.ActivityDTO;
import com.associago.activity.mapper.ActivityMapper;
import com.associago.stats.dto.ActivityFinancialSummaryDTO;
import com.associago.stats.dto.ActivityWithDetailsDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
public class ActivityController {

    private final ActivityService activityService;

    @Autowired
    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    // --- Basic Activity CRUD ---

    @GetMapping
    public List<ActivityDTO> getActivities(@RequestParam(required = false) Long associationId) {
        if (associationId != null) {
            return activityService.findByAssociationId(associationId).stream()
                    .map(ActivityMapper::toDTO)
                    .toList();
        }
        return List.of();
    }

    @GetMapping("/association/{associationId}")
    public List<ActivityDTO> getActivitiesByAssociation(@PathVariable Long associationId) {
        return activityService.findByAssociationId(associationId).stream()
                .map(ActivityMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivityById(@PathVariable Long id) {
        return activityService.findById(id)
                .map(ActivityMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ActivityDTO createActivity(@Valid @RequestBody ActivityCreateDTO dto) {
        Activity entity = ActivityMapper.toEntity(dto);
        return ActivityMapper.toDTO(activityService.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> updateActivity(@PathVariable Long id, @Valid @RequestBody ActivityCreateDTO dto) {
        return activityService.findById(id)
                .map(existing -> {
                    ActivityMapper.updateEntity(existing, dto);
                    return ResponseEntity.ok(ActivityMapper.toDTO(activityService.save(existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        if (activityService.findById(id).isPresent()) {
            activityService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Advanced Reporting Endpoints ---

    @GetMapping("/{id}/details")
    public ResponseEntity<ActivityWithDetailsDTO> getActivityDetails(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(activityService.getActivityWithDetails(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/financial-summary")
    public ResponseEntity<ActivityFinancialSummaryDTO> getActivityFinancialSummary(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(activityService.getActivityFinancialSummary(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- Sub-Resources Management ---

    // Participants
    @GetMapping("/{id}/participants")
    public List<ActivityParticipant> getParticipants(@PathVariable Long id) {
        return activityService.findParticipantsByActivityId(id);
    }

    @PostMapping("/{id}/participants")
    public ActivityParticipant addParticipant(@PathVariable Long id, @RequestBody ActivityParticipant participant) {
        participant.setActivityId(id);
        return activityService.registerParticipant(participant);
    }

    @DeleteMapping("/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long participantId) {
        activityService.removeParticipant(participantId);
        return ResponseEntity.noContent().build();
    }

    // Costs
    @GetMapping("/{id}/costs")
    public List<ActivityCost> getCosts(@PathVariable Long id) {
        return activityService.findCostsByActivityId(id);
    }

    @PostMapping("/{id}/costs")
    public ActivityCost addCost(@PathVariable Long id, @RequestBody ActivityCost cost) {
        cost.setActivityId(id);
        return activityService.addCost(cost);
    }

    @PutMapping("/costs/{costId}")
    public ResponseEntity<ActivityCost> updateCost(@PathVariable Long costId, @RequestBody ActivityCost cost) {
        try {
            return ResponseEntity.ok(activityService.updateCost(costId, cost));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/costs/{costId}")
    public ResponseEntity<Void> deleteCost(@PathVariable Long costId) {
        activityService.deleteCost(costId);
        return ResponseEntity.noContent().build();
    }

    // Instructors
    @GetMapping("/{id}/instructors")
    public List<ActivityInstructor> getInstructors(@PathVariable Long id) {
        return activityService.findInstructorsByActivityId(id);
    }

    @PostMapping("/{id}/instructors")
    public ActivityInstructor addInstructor(@PathVariable Long id, @RequestBody ActivityInstructor instructor) {
        instructor.setActivityId(id);
        return activityService.addInstructor(instructor);
    }

    @PutMapping("/instructors/{instructorId}")
    public ResponseEntity<ActivityInstructor> updateInstructor(@PathVariable Long instructorId, @RequestBody ActivityInstructor instructor) {
        try {
            return ResponseEntity.ok(activityService.updateInstructor(instructorId, instructor));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/instructors/{instructorId}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable Long instructorId) {
        activityService.deleteInstructor(instructorId);
        return ResponseEntity.noContent().build();
    }

    // Schedules
    @GetMapping("/{id}/schedules")
    public List<ActivitySchedule> getSchedules(@PathVariable Long id) {
        return activityService.findSchedulesByActivityId(id);
    }

    @PostMapping("/{id}/schedules")
    public ActivitySchedule addSchedule(@PathVariable Long id, @RequestBody ActivitySchedule schedule) {
        schedule.setActivityId(id);
        return activityService.addSchedule(schedule);
    }

    @PutMapping("/schedules/{scheduleId}")
    public ResponseEntity<ActivitySchedule> updateSchedule(@PathVariable Long scheduleId, @RequestBody ActivitySchedule schedule) {
        try {
            return ResponseEntity.ok(activityService.updateSchedule(scheduleId, schedule));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long scheduleId) {
        activityService.deleteSchedule(scheduleId);
        return ResponseEntity.noContent().build();
    }
}
