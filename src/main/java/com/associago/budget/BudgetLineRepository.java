package com.associago.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetLineRepository extends JpaRepository<BudgetLine, Long> {
    List<BudgetLine> findByBudgetIdOrderBySortOrder(Long budgetId);
    List<BudgetLine> findByBudgetIdAndType(Long budgetId, String type);
    void deleteByBudgetId(Long budgetId);
}
