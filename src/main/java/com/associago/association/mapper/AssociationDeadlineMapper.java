package com.associago.association.mapper;

import com.associago.association.AssociationDeadline;
import com.associago.association.dto.AssociationDeadlineDTO;
import com.associago.association.dto.AssociationDeadlineUpsertDTO;

public class AssociationDeadlineMapper {

    private AssociationDeadlineMapper() {}

    public static AssociationDeadlineDTO toDTO(AssociationDeadline entity) {
        return new AssociationDeadlineDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getDueDate(),
                entity.getCategory(),
                entity.getStatus(),
                entity.getCompletedAt(),
                entity.getCompletedBy(),
                entity.getReminderDays(),
                entity.isRecurring(),
                entity.getRecurringMonths(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static AssociationDeadline toEntity(AssociationDeadlineUpsertDTO dto) {
        AssociationDeadline entity = new AssociationDeadline();
        updateEntity(entity, dto);
        return entity;
    }

    public static void updateEntity(AssociationDeadline entity, AssociationDeadlineUpsertDTO dto) {
        if (dto.title() != null) entity.setTitle(dto.title());
        if (dto.description() != null) entity.setDescription(dto.description());
        if (dto.dueDate() != null) entity.setDueDate(dto.dueDate());
        if (dto.category() != null) entity.setCategory(dto.category());
        if (dto.status() != null) entity.setStatus(dto.status());
        if (dto.reminderDays() != null) entity.setReminderDays(dto.reminderDays());
        if (dto.recurring() != null) entity.setRecurring(dto.recurring());
        if (dto.recurringMonths() != null) entity.setRecurringMonths(dto.recurringMonths());
    }
}
