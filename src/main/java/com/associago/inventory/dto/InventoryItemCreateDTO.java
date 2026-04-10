package com.associago.inventory.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryItemCreateDTO(
        Long associationId,
        String inventoryCode,
        @NotBlank String name,
        String description,
        String category,
        Integer quantity,
        String location,
        String acquisitionMethod,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        BigDecimal currentValue,
        Integer depreciationYears,
        String condition,
        String status,
        Long assignedTo,
        String photoPath,
        String notes
) {}
