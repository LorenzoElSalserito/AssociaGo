package com.associago.balance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AnnualBalanceRepository extends JpaRepository<AnnualBalance, Long> {
    List<AnnualBalance> findByAssociationIdOrderByYearDesc(Long associationId);
    Optional<AnnualBalance> findByAssociationIdAndYear(Long associationId, Integer year);
}
