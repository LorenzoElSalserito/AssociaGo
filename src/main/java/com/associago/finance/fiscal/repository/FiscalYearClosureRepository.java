package com.associago.finance.fiscal.repository;

import com.associago.finance.fiscal.FiscalYearClosure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FiscalYearClosureRepository extends JpaRepository<FiscalYearClosure, Long> {
    Optional<FiscalYearClosure> findByAssociationIdAndYear(Long associationId, Integer year);
}
