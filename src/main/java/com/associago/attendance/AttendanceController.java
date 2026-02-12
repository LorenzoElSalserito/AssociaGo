package com.associago.attendance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<AttendanceSession>> getSessionsByActivity(@PathVariable Long activityId) {
        return ResponseEntity.ok(attendanceService.getSessionsByActivity(activityId));
    }

    @GetMapping("/session/{id}")
    public ResponseEntity<AttendanceSession> getSessionById(@PathVariable Long id) {
        return attendanceService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/session")
    public ResponseEntity<AttendanceSession> createSession(@RequestBody AttendanceSession session) {
        return ResponseEntity.ok(attendanceService.createSession(session));
    }

    @PutMapping("/session/{id}")
    public ResponseEntity<AttendanceSession> updateSession(@PathVariable Long id, @RequestBody AttendanceSession session) {
        try {
            return ResponseEntity.ok(attendanceService.updateSession(id, session));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/session/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        attendanceService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/session/{id}/records")
    public ResponseEntity<List<AttendanceRecord>> getRecordsBySession(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getRecordsBySession(id));
    }

    @PostMapping("/record")
    public ResponseEntity<AttendanceRecord> createRecord(@RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(attendanceService.createRecord(record));
    }

    @PutMapping("/record/{id}")
    public ResponseEntity<AttendanceRecord> updateRecord(@PathVariable Long id, @RequestBody AttendanceRecord record) {
        try {
            return ResponseEntity.ok(attendanceService.updateRecord(id, record));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
