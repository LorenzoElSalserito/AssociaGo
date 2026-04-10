package com.associago.event.mapper;

import com.associago.event.Event;
import com.associago.event.dto.EventCreateDTO;
import com.associago.event.dto.EventDTO;

import java.time.LocalDateTime;

public final class EventMapper {

    private EventMapper() {}

    public static EventDTO toDTO(Event entity) {
        if (entity == null) return null;
        return new EventDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getName(),
                entity.getDescription(),
                entity.getType(),
                entity.getStartDatetime(),
                entity.getEndDatetime(),
                entity.getLocation(),
                entity.getAddress(),
                entity.getMaxParticipants(),
                entity.getCostMember(),
                entity.getCostNonMember(),
                entity.getIsPublic(),
                entity.getStatus(),
                entity.isRequireRegistration(),
                entity.isGenerateInvoice(),
                entity.getCancellationDate(),
                entity.getCancellationReason(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static Event toEntity(EventCreateDTO dto) {
        if (dto == null) return null;
        Event entity = new Event();
        entity.setAssociationId(dto.associationId());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setType(dto.type());
        entity.setStartDatetime(dto.startDatetime());
        entity.setEndDatetime(dto.endDatetime());
        entity.setLocation(dto.location());
        entity.setAddress(dto.address());
        entity.setMaxParticipants(dto.maxParticipants());
        entity.setCostMember(dto.costMember());
        entity.setCostNonMember(dto.costNonMember());
        entity.setIsPublic(dto.isPublic());
        entity.setStatus(dto.status());
        entity.setRequireRegistration(dto.requireRegistration());
        entity.setGenerateInvoice(dto.generateInvoice());
        return entity;
    }

    public static void updateEntity(Event entity, EventCreateDTO dto) {
        if (entity == null || dto == null) return;
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setType(dto.type());
        entity.setStartDatetime(dto.startDatetime());
        entity.setEndDatetime(dto.endDatetime());
        entity.setLocation(dto.location());
        entity.setAddress(dto.address());
        entity.setMaxParticipants(dto.maxParticipants());
        entity.setCostMember(dto.costMember());
        entity.setCostNonMember(dto.costNonMember());
        entity.setIsPublic(dto.isPublic());
        entity.setStatus(dto.status());
        entity.setRequireRegistration(dto.requireRegistration());
        entity.setGenerateInvoice(dto.generateInvoice());
        entity.setUpdatedAt(LocalDateTime.now());
    }
}
