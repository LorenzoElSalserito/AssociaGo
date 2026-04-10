package com.associago.finance.mapper;

import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.finance.dto.TransactionCreateDTO;
import com.associago.finance.dto.TransactionDTO;

import java.time.LocalDateTime;

public final class TransactionMapper {

    private TransactionMapper() {}

    public static TransactionDTO toDTO(Transaction entity) {
        if (entity == null) return null;
        return new TransactionDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getDate(),
                entity.getAmount(),
                entity.getType() != null ? entity.getType().name() : null,
                entity.getCategoryId(),
                entity.getCategory(),
                entity.getDescription(),
                entity.getPaymentMethod(),
                entity.getReferenceId(),
                entity.getUserId(),
                entity.getEventId(),
                entity.getActivityId(),
                entity.getProjectId(),
                entity.getFundId(),
                entity.getCostCenter(),
                entity.getMembershipId(),
                entity.getInventoryItemId(),
                entity.getReceiptPath(),
                entity.isVerified(),
                entity.getVerifiedBy() != null ? entity.getVerifiedBy().getId() : null,
                entity.getVerifiedAt(),
                entity.isRenewal(),
                entity.getRenewalYear(),
                entity.getQuotaPeriod(),
                entity.getCommissionAmount(),
                entity.getNetAmount(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy()
        );
    }

    public static Transaction toEntity(TransactionCreateDTO dto) {
        if (dto == null) return null;
        Transaction entity = new Transaction();
        entity.setAssociationId(dto.associationId());
        entity.setDate(dto.date());
        entity.setAmount(dto.amount());
        entity.setType(dto.type() != null ? TransactionType.valueOf(dto.type()) : null);
        entity.setCategory(dto.category());
        entity.setDescription(dto.description());
        entity.setPaymentMethod(dto.paymentMethod());
        entity.setReferenceId(dto.referenceId());
        entity.setUserId(dto.userId());
        entity.setEventId(dto.eventId());
        entity.setActivityId(dto.activityId());
        entity.setMembershipId(dto.membershipId());
        entity.setProjectId(dto.projectId());
        entity.setFundId(dto.fundId());
        entity.setCostCenter(dto.costCenter());
        return entity;
    }

    public static void updateEntity(Transaction entity, TransactionCreateDTO dto) {
        if (entity == null || dto == null) return;
        entity.setDate(dto.date());
        entity.setAmount(dto.amount());
        entity.setType(dto.type() != null ? TransactionType.valueOf(dto.type()) : null);
        entity.setCategory(dto.category());
        entity.setDescription(dto.description());
        entity.setPaymentMethod(dto.paymentMethod());
        entity.setReferenceId(dto.referenceId());
        entity.setUserId(dto.userId());
        entity.setEventId(dto.eventId());
        entity.setActivityId(dto.activityId());
        entity.setMembershipId(dto.membershipId());
        entity.setProjectId(dto.projectId());
        entity.setFundId(dto.fundId());
        entity.setCostCenter(dto.costCenter());
        entity.setUpdatedAt(LocalDateTime.now());
    }
}
