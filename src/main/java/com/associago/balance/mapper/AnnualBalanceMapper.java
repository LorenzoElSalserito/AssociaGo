package com.associago.balance.mapper;

import com.associago.balance.AnnualBalance;
import com.associago.balance.AnnualBalanceLine;
import com.associago.balance.dto.AnnualBalanceDTO;
import com.associago.balance.dto.AnnualBalanceLineDTO;

public class AnnualBalanceMapper {

    private AnnualBalanceMapper() {}

    public static AnnualBalanceDTO toDTO(AnnualBalance entity) {
        return new AnnualBalanceDTO(
                entity.getId(),
                entity.getAssociationId(),
                entity.getYear(),
                entity.getTitle(),
                entity.getStatus(),
                entity.getTotalIncome(),
                entity.getTotalExpenses(),
                entity.getNetResult(),
                entity.getOpeningFund(),
                entity.getClosingFund(),
                entity.getComputedAt(),
                entity.getApprovedBy(),
                entity.getApprovedAt(),
                entity.getSignatories(),
                entity.getPdfPath(),
                entity.getChecksum(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static AnnualBalanceLineDTO toDTO(AnnualBalanceLine entity) {
        return new AnnualBalanceLineDTO(
                entity.getId(),
                entity.getBalanceId(),
                entity.getSection(),
                entity.getCategoryId(),
                entity.getLabel(),
                entity.getAmount(),
                entity.getPreviousYearAmount(),
                entity.getVariance(),
                entity.getVariancePct(),
                entity.getSortOrder(),
                entity.isSubtotal(),
                entity.getNotes()
        );
    }
}
