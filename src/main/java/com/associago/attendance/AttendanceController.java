package com.associago.attendance;

import com.associago.attendance.dto.AttendanceRecordDTO;
import com.associago.attendance.dto.AttendanceRecordUpsertDTO;
import com.associago.attendance.dto.AttendanceSessionDTO;
import com.associago.attendance.dto.AttendanceSessionUpsertDTO;
import com.associago.attendance.mapper.AttendanceMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/attendance", "/api/v1/attendance"})
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<AttendanceSessionDTO>> getSessionsByActivity(@PathVariable Long activityId) {
        return ResponseEntity.ok(attendanceService.getSessionsByActivity(activityId).stream()
                .map(AttendanceMapper::toDTO)
                .toList());
    }

    @GetMapping("/session/{id}")
    public ResponseEntity<AttendanceSessionDTO> getSessionById(@PathVariable Long id) {
        return attendanceService.getSessionById(id)
                .map(AttendanceMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/session")
    public ResponseEntity<AttendanceSessionDTO> createSession(@RequestBody AttendanceSessionUpsertDTO session) {
        AttendanceSession entity = AttendanceMapper.toEntity(session);
        return ResponseEntity.ok(AttendanceMapper.toDTO(attendanceService.createSession(entity)));
    }

    @PutMapping("/session/{id}")
    public ResponseEntity<AttendanceSessionDTO> updateSession(@PathVariable Long id, @RequestBody AttendanceSessionUpsertDTO session) {
        try {
            AttendanceSession entity = attendanceService.getSessionById(id).orElseThrow();
            AttendanceMapper.updateEntity(entity, session);
            return ResponseEntity.ok(AttendanceMapper.toDTO(attendanceService.updateSession(id, entity)));
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
    public ResponseEntity<List<AttendanceRecordDTO>> getRecordsBySession(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getRecordsBySession(id).stream()
                .map(AttendanceMapper::toDTO)
                .toList());
    }

    @PostMapping("/record")
    public ResponseEntity<AttendanceRecordDTO> createRecord(@RequestBody AttendanceRecordUpsertDTO record) {
        AttendanceRecord entity = AttendanceMapper.toEntity(record);
        return ResponseEntity.ok(AttendanceMapper.toDTO(attendanceService.createRecord(entity)));
    }

    @PutMapping("/record/{id}")
    public ResponseEntity<AttendanceRecordDTO> updateRecord(@PathVariable Long id, @RequestBody AttendanceRecordUpsertDTO record) {
        try {
            AttendanceRecord entity = attendanceService.getRecordById(id).orElseThrow();
            AttendanceMapper.updateEntity(entity, record);
            return ResponseEntity.ok(AttendanceMapper.toDTO(attendanceService.updateRecord(id, entity)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
