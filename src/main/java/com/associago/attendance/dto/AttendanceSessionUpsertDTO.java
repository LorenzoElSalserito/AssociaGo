package com.associago.attendance.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceSessionUpsertDTO(
        Long activityId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Long instructorId,
        String notes
) {}
