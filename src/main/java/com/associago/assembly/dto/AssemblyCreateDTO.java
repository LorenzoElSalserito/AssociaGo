package com.associago.assembly.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record AssemblyCreateDTO(
        Long associationId,
        @NotBlank String title,
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
        String notes
) {}
