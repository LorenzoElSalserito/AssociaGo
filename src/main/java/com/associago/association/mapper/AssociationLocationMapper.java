package com.associago.association.mapper;

import com.associago.association.AssociationLocation;
import com.associago.association.dto.AssociationLocationDTO;
import com.associago.association.dto.AssociationLocationUpsertDTO;

public class AssociationLocationMapper {

    private AssociationLocationMapper() {}

    public static AssociationLocationDTO toDTO(AssociationLocation entity) {
        return new AssociationLocationDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getLocationType(),
                entity.getName(),
                entity.getAddress(),
                entity.getCity(),
                entity.getProvince(),
                entity.getPostalCode(),
                entity.getCountry(),
                entity.getPhone(),
                entity.getEmail(),
                entity.isPrimary(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static AssociationLocation toEntity(AssociationLocationUpsertDTO dto) {
        AssociationLocation entity = new AssociationLocation();
        updateEntity(entity, dto);
        return entity;
    }

    public static void updateEntity(AssociationLocation entity, AssociationLocationUpsertDTO dto) {
        if (dto.locationType() != null) entity.setLocationType(dto.locationType());
        if (dto.name() != null) entity.setName(dto.name());
        if (dto.address() != null) entity.setAddress(dto.address());
        if (dto.city() != null) entity.setCity(dto.city());
        if (dto.province() != null) entity.setProvince(dto.province());
        if (dto.postalCode() != null) entity.setPostalCode(dto.postalCode());
        if (dto.country() != null) entity.setCountry(dto.country());
        if (dto.phone() != null) entity.setPhone(dto.phone());
        if (dto.email() != null) entity.setEmail(dto.email());
        if (dto.isPrimary() != null) entity.setPrimary(dto.isPrimary());
        if (dto.notes() != null) entity.setNotes(dto.notes());
    }
}
