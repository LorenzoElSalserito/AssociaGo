package com.associago.budget.mapper;

import com.associago.budget.Budget;
import com.associago.budget.BudgetLine;
import com.associago.budget.dto.BudgetDTO;
import com.associago.budget.dto.BudgetLineDTO;
import com.associago.budget.dto.BudgetLineUpsertDTO;
import com.associago.budget.dto.BudgetUpsertDTO;

public class BudgetMapper {

    private BudgetMapper() {}

    public static BudgetDTO toDTO(Budget entity) {
        return new BudgetDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getYear(),
                entity.getName(),
                entity.getName(),
                entity.getStatus(),
                entity.getApprovedBy(),
                entity.getApprovedAt(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static Budget toEntity(BudgetUpsertDTO dto) {
        Budget entity = new Budget();
        updateEntity(entity, dto);
        return entity;
    }

    public static void updateEntity(Budget entity, BudgetUpsertDTO dto) {
        if (dto.associationId() != null) entity.setAssociationId(dto.associationId());
        if (dto.year() != null) entity.setYear(dto.year());
        String resolvedName = firstNonBlank(dto.name(), dto.title());
        if (resolvedName != null) entity.setName(resolvedName);
        if (dto.notes() != null) entity.setNotes(dto.notes());
    }

    public static BudgetLineDTO toDTO(BudgetLine entity) {
        return new BudgetLineDTO(
                entity.getId(),
                entity.getBudgetId(),
                entity.getCategoryId(),
                entity.getLabel(),
                entity.getLabel(),
                entity.getType(),
                entity.getType(),
                entity.getBudgetedAmount(),
                entity.getActualAmount(),
                entity.getForecastAmount(),
                entity.getSortOrder(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static void updateLineEntity(BudgetLine entity, BudgetLineUpsertDTO dto) {
        if (dto.categoryId() != null) entity.setCategoryId(dto.categoryId());
        String resolvedLabel = firstNonBlank(dto.label(), dto.category());
        if (resolvedLabel != null) entity.setLabel(resolvedLabel);
        String resolvedType = firstNonBlank(dto.type(), dto.section());
        if (resolvedType != null) entity.setType(resolvedType.toUpperCase());
        if (dto.budgetedAmount() != null) entity.setBudgetedAmount(dto.budgetedAmount());
        if (dto.forecastAmount() != null) entity.setForecastAmount(dto.forecastAmount());
        if (dto.sortOrder() != null) entity.setSortOrder(dto.sortOrder());
        if (dto.notes() != null) entity.setNotes(dto.notes());
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) return first;
        if (second != null && !second.isBlank()) return second;
        return null;
    }
}
