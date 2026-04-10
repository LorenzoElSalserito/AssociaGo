package com.associago.activity.mapper;

import com.associago.activity.Activity;
import com.associago.activity.dto.ActivityCreateDTO;
import com.associago.activity.dto.ActivityDTO;

import java.time.LocalDateTime;

public final class ActivityMapper {

    private ActivityMapper() {}

    public static ActivityDTO toDTO(Activity entity) {
        if (entity == null) return null;
        return new ActivityDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getName(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getLocation(),
                entity.getMaxParticipants(),
                entity.getCost(),
                entity.isActive(),
                entity.getSubscriptionType(),
                entity.getScheduleDetails(),
                entity.isRequireRegistration(),
                entity.isGenerateInvoice(),
                entity.getImagePath(),
                entity.getDocumentPath(),
                entity.getCancellationDate(),
                entity.getCancellationReason(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static Activity toEntity(ActivityCreateDTO dto) {
        if (dto == null) return null;
        Activity entity = new Activity();
        entity.setAssociationId(dto.associationId());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setCategory(dto.category());
        entity.setStartDate(dto.startDate());
        entity.setEndDate(dto.endDate());
        entity.setStartTime(dto.startTime());
        entity.setEndTime(dto.endTime());
        entity.setLocation(dto.location());
        entity.setMaxParticipants(dto.maxParticipants());
        entity.setCost(dto.cost());
        entity.setActive(dto.isActive());
        entity.setSubscriptionType(dto.subscriptionType());
        entity.setScheduleDetails(dto.scheduleDetails());
        entity.setRequireRegistration(dto.requireRegistration());
        entity.setGenerateInvoice(dto.generateInvoice());
        entity.setImagePath(dto.imagePath());
        entity.setDocumentPath(dto.documentPath());
        return entity;
    }

    public static void updateEntity(Activity entity, ActivityCreateDTO dto) {
        if (entity == null || dto == null) return;
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setCategory(dto.category());
        entity.setStartDate(dto.startDate());
        entity.setEndDate(dto.endDate());
        entity.setStartTime(dto.startTime());
        entity.setEndTime(dto.endTime());
        entity.setLocation(dto.location());
        entity.setMaxParticipants(dto.maxParticipants());
        entity.setCost(dto.cost());
        entity.setActive(dto.isActive());
        entity.setSubscriptionType(dto.subscriptionType());
        entity.setScheduleDetails(dto.scheduleDetails());
        entity.setRequireRegistration(dto.requireRegistration());
        entity.setGenerateInvoice(dto.generateInvoice());
        entity.setImagePath(dto.imagePath());
        entity.setDocumentPath(dto.documentPath());
        entity.setUpdatedAt(LocalDateTime.now());
    }
}
