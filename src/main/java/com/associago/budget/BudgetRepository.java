package com.associago.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByAssociationIdOrderByYearDesc(Long associationId);
    Optional<Budget> findByAssociationIdAndYear(Long associationId, Integer year);
}
