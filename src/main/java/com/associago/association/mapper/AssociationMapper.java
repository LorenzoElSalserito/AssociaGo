package com.associago.association.mapper;

import com.associago.association.Association;
import com.associago.association.dto.AssociationCreateDTO;
import com.associago.association.dto.AssociationDTO;
import com.associago.association.dto.AssociationUpdateDTO;

public class AssociationMapper {

    private AssociationMapper() {}

    public static AssociationDTO toDTO(Association entity) {
        return new AssociationDTO(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getEmail(),
                entity.getTaxCode(),
                entity.getVatNumber(),
                entity.getType(),
                entity.getAddress(),
                entity.getCity(),
                entity.getProvince(),
                entity.getZipCode(),
                entity.getPhone(),
                entity.getDescription(),
                entity.getPresident(),
                entity.getVicePresident(),
                entity.getSecretary(),
                entity.getTreasurer(),
                entity.getStatutePath(),
                entity.getRegulationPath(),
                entity.getSecondaryLogoPath(),
                entity.getPartnerLogoPath(),
                entity.getFoundationDate(),
                entity.isActive(),
                entity.getMembershipNumberFormat(),
                entity.getBaseMembershipFee(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static Association toEntity(AssociationCreateDTO dto) {
        Association entity = new Association();
        entity.setName(dto.name());
        entity.setSlug(dto.slug());
        entity.setEmail(dto.email());
        entity.setPassword(dto.password());
        entity.setTaxCode(dto.taxCode());
        entity.setType(dto.type());
        return entity;
    }

    public static void updateEntity(Association entity, AssociationUpdateDTO dto) {
        if (dto.name() != null) entity.setName(dto.name());
        if (dto.email() != null) entity.setEmail(dto.email());
        if (dto.taxCode() != null) entity.setTaxCode(dto.taxCode());
        if (dto.vatNumber() != null) entity.setVatNumber(dto.vatNumber());
        if (dto.type() != null) entity.setType(dto.type());
        if (dto.address() != null) entity.setAddress(dto.address());
        if (dto.city() != null) entity.setCity(dto.city());
        if (dto.province() != null) entity.setProvince(dto.province());
        if (dto.zipCode() != null) entity.setZipCode(dto.zipCode());
        if (dto.phone() != null) entity.setPhone(dto.phone());
        if (dto.description() != null) entity.setDescription(dto.description());
        if (dto.president() != null) entity.setPresident(dto.president());
        if (dto.vicePresident() != null) entity.setVicePresident(dto.vicePresident());
        if (dto.secretary() != null) entity.setSecretary(dto.secretary());
        if (dto.treasurer() != null) entity.setTreasurer(dto.treasurer());
        if (dto.statutePath() != null) entity.setStatutePath(dto.statutePath());
        if (dto.regulationPath() != null) entity.setRegulationPath(dto.regulationPath());
        if (dto.secondaryLogoPath() != null) entity.setSecondaryLogoPath(dto.secondaryLogoPath());
        if (dto.partnerLogoPath() != null) entity.setPartnerLogoPath(dto.partnerLogoPath());
        if (dto.foundationDate() != null) entity.setFoundationDate(dto.foundationDate());
        if (dto.membershipNumberFormat() != null) entity.setMembershipNumberFormat(dto.membershipNumberFormat());
        if (dto.baseMembershipFee() != null) entity.setBaseMembershipFee(dto.baseMembershipFee());
        if (dto.useRemoteDb() != null) entity.setUseRemoteDb(dto.useRemoteDb());
        if (dto.dbType() != null) entity.setDbType(dto.dbType());
        if (dto.dbHost() != null) entity.setDbHost(dto.dbHost());
        if (dto.dbPort() != null) entity.setDbPort(dto.dbPort());
        if (dto.dbName() != null) entity.setDbName(dto.dbName());
        if (dto.dbUser() != null) entity.setDbUser(dto.dbUser());
        if (dto.dbPassword() != null) entity.setDbPassword(dto.dbPassword());
        if (dto.dbSsl() != null) entity.setDbSsl(dto.dbSsl());
    }
}
