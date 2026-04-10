package com.associago.attendance;

import com.associago.attendance.repository.AttendanceRecordRepository;
import com.associago.attendance.repository.AttendanceSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;

    public AttendanceService(AttendanceSessionRepository sessionRepository, AttendanceRecordRepository recordRepository) {
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
    }

    public List<AttendanceSession> getSessionsByActivity(Long activityId) {
        return sessionRepository.findByActivityId(activityId);
    }

    public Optional<AttendanceSession> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    @Transactional
    public AttendanceSession createSession(AttendanceSession session) {
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        return sessionRepository.save(session);
    }

    @Transactional
    public AttendanceSession updateSession(Long id, AttendanceSession sessionDetails) {
        return sessionRepository.findById(id).map(session -> {
            session.setActivityId(sessionDetails.getActivityId());
            session.setDate(sessionDetails.getDate());
            session.setStartTime(sessionDetails.getStartTime());
            session.setEndTime(sessionDetails.getEndTime());
            session.setInstructorId(sessionDetails.getInstructorId());
            session.setNotes(sessionDetails.getNotes());
            session.setUpdatedAt(LocalDateTime.now());
            return sessionRepository.save(session);
        }).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    // Records
    public List<AttendanceRecord> getRecordsBySession(Long sessionId) {
        return recordRepository.findBySessionId(sessionId);
    }

    public Optional<AttendanceRecord> getRecordById(Long id) {
        return recordRepository.findById(id);
    }

    @Transactional
    public AttendanceRecord createRecord(AttendanceRecord record) {
        if (record.getStatus() == null) {
            record.setStatus("PRESENT");
        }
        return recordRepository.save(record);
    }

    @Transactional
    public AttendanceRecord updateRecord(Long id, AttendanceRecord recordDetails) {
        return recordRepository.findById(id).map(record -> {
            record.setSessionId(recordDetails.getSessionId());
            record.setMemberId(recordDetails.getMemberId());
            record.setStatus(recordDetails.getStatus());
            record.setCheckInTime(recordDetails.getCheckInTime());
            record.setNotes(recordDetails.getNotes());
            return recordRepository.save(record);
        }).orElseThrow(() -> new RuntimeException("Record not found"));
    }
}
