package com.associago.attendance.mapper;

import com.associago.attendance.AttendanceRecord;
import com.associago.attendance.AttendanceSession;
import com.associago.attendance.dto.AttendanceRecordDTO;
import com.associago.attendance.dto.AttendanceRecordUpsertDTO;
import com.associago.attendance.dto.AttendanceSessionDTO;
import com.associago.attendance.dto.AttendanceSessionUpsertDTO;

public class AttendanceMapper {

    private AttendanceMapper() {}

    public static AttendanceSessionDTO toDTO(AttendanceSession entity) {
        return new AttendanceSessionDTO(
                entity.getId(),
                entity.getActivityId(),
                entity.getDate(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getInstructorId(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static AttendanceSession toEntity(AttendanceSessionUpsertDTO dto) {
        AttendanceSession entity = new AttendanceSession();
        updateEntity(entity, dto);
        return entity;
    }

    public static void updateEntity(AttendanceSession entity, AttendanceSessionUpsertDTO dto) {
        if (dto.activityId() != null) entity.setActivityId(dto.activityId());
        if (dto.date() != null) entity.setDate(dto.date());
        if (dto.startTime() != null) entity.setStartTime(dto.startTime());
        if (dto.endTime() != null) entity.setEndTime(dto.endTime());
        if (dto.instructorId() != null) entity.setInstructorId(dto.instructorId());
        if (dto.notes() != null) entity.setNotes(dto.notes());
    }

    public static AttendanceRecordDTO toDTO(AttendanceRecord entity) {
        return new AttendanceRecordDTO(
                entity.getId(),
                entity.getSessionId(),
                entity.getMemberId(),
                entity.getStatus(),
                entity.getCheckInTime(),
                entity.getNotes()
        );
    }

    public static AttendanceRecord toEntity(AttendanceRecordUpsertDTO dto) {
        AttendanceRecord entity = new AttendanceRecord();
        updateEntity(entity, dto);
        return entity;
    }

    public static void updateEntity(AttendanceRecord entity, AttendanceRecordUpsertDTO dto) {
        if (dto.sessionId() != null) entity.setSessionId(dto.sessionId());
        if (dto.memberId() != null) entity.setMemberId(dto.memberId());
        if (dto.status() != null) entity.setStatus(dto.status());
        if (dto.checkInTime() != null) entity.setCheckInTime(dto.checkInTime());
        if (dto.notes() != null) entity.setNotes(dto.notes());
    }
}
