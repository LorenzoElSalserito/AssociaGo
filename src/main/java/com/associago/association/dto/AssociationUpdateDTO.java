package com.associago.association.dto;

import java.time.LocalDate;

public record AssociationUpdateDTO(
        String name,
        String email,
        String taxCode,
        String vatNumber,
        String type,
        String address,
        String city,
        String province,
        String zipCode,
        String phone,
        String description,
        String president,
        String vicePresident,
        String secretary,
        String treasurer,
        String statutePath,
        String regulationPath,
        String secondaryLogoPath,
        String partnerLogoPath,
        LocalDate foundationDate,
        String membershipNumberFormat,
        Double baseMembershipFee,
        Boolean useRemoteDb,
        String dbType,
        String dbHost,
        Integer dbPort,
        String dbName,
        String dbUser,
        String dbPassword,
        Boolean dbSsl
) {}
