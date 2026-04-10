package com.associago.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InventoryItemDTO(
        Long id,
        Long associationId,
        String inventoryCode,
        String name,
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
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
