package com.associago.attendance.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AttendanceSessionDTO(
        Long id,
        Long activityId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Long instructorId,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
