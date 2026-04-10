package com.associago.assembly.dto;

import java.time.LocalDateTime;

public record AssemblyDTO(
        Long id,
        Long associationId,
        String title,
        String description,
        LocalDateTime date,
        String startTime,
        String endTime,
        String location,
        String type,
        String status,
        String president,
        String secretary,
        Double firstCallQuorum,
        Double secondCallQuorum,
        boolean quorumReached,
        String minutesPath,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
