package com.associago.finance.fiscal.repository;

import com.associago.finance.fiscal.FiscalComparison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FiscalComparisonRepository extends JpaRepository<FiscalComparison, Long> {
    List<FiscalComparison> findByAssociationId(Long associationId);
}
