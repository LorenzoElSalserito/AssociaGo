package com.associago.attendance.dto;

import java.time.LocalTime;

public record AttendanceRecordUpsertDTO(
        Long sessionId,
        Long memberId,
        String status,
        LocalTime checkInTime,
        String notes
) {}
