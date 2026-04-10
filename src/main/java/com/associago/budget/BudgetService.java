package com.associago.budget;

import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.finance.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetLineRepository budgetLineRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         BudgetLineRepository budgetLineRepository,
                         TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.budgetLineRepository = budgetLineRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Budget> findByAssociation(Long associationId) {
        return budgetRepository.findByAssociationIdOrderByYearDesc(associationId);
    }

    public Budget findById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found: " + id));
    }

    @Transactional
    public Budget create(Budget budget) {
        budget.setCreatedAt(LocalDateTime.now());
        budget.setUpdatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    @Transactional
    public Budget update(Long id, Budget details) {
        Budget budget = findById(id);
        budget.setName(details.getName());
        budget.setNotes(details.getNotes());
        budget.setUpdatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    @Transactional
    public void delete(Long id) {
        budgetRepository.deleteById(id);
    }

    @Transactional
    public Budget approve(Long id, Long approvedBy) {
        Budget budget = findById(id);
        budget.setStatus("APPROVED");
        budget.setApprovedBy(approvedBy);
        budget.setApprovedAt(LocalDateTime.now());
        budget.setUpdatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    // --- Budget Lines ---

    public List<BudgetLine> getLines(Long budgetId) {
        return budgetLineRepository.findByBudgetIdOrderBySortOrder(budgetId);
    }

    public BudgetLine findLineById(Long lineId) {
        return budgetLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Budget line not found: " + lineId));
    }

    @Transactional
    public BudgetLine addLine(BudgetLine line) {
        line.setCreatedAt(LocalDateTime.now());
        line.setUpdatedAt(LocalDateTime.now());
        return budgetLineRepository.save(line);
    }

    @Transactional
    public BudgetLine updateLine(Long lineId, BudgetLine details) {
        BudgetLine line = budgetLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Budget line not found: " + lineId));
        line.setLabel(details.getLabel());
        line.setType(details.getType());
        line.setBudgetedAmount(details.getBudgetedAmount());
        line.setForecastAmount(details.getForecastAmount());
        line.setSortOrder(details.getSortOrder());
        line.setNotes(details.getNotes());
        line.setUpdatedAt(LocalDateTime.now());
        return budgetLineRepository.save(line);
    }

    @Transactional
    public void deleteLine(Long lineId) {
        budgetLineRepository.deleteById(lineId);
    }

    /**
     * Syncs actual amounts from transactions for a given budget year.
     * Computes consuntivo vs preventivo (actual vs budget).
     */
    @Transactional
    public Budget syncActuals(Long budgetId) {
        Budget budget = findById(budgetId);
        LocalDate yearStart = LocalDate.of(budget.getYear(), 1, 1);
        LocalDate yearEnd = LocalDate.of(budget.getYear(), 12, 31);

        List<Transaction> transactions = transactionRepository
                .findByAssociationIdAndDateBetween(budget.getAssociationId(), yearStart, yearEnd);

        List<BudgetLine> lines = budgetLineRepository.findByBudgetIdOrderBySortOrder(budgetId);

        for (BudgetLine line : lines) {
            BigDecimal actual = transactions.stream()
                    .filter(t -> matchesLine(t, line))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            line.setActualAmount(actual);
            line.setUpdatedAt(LocalDateTime.now());
        }
        budgetLineRepository.saveAll(lines);

        // Compute forecast: actual + (budgeted - actual) * remaining_months_ratio
        int currentMonth = LocalDate.now().getMonthValue();
        if (budget.getYear() == LocalDate.now().getYear() && currentMonth < 12) {
            BigDecimal monthsElapsed = BigDecimal.valueOf(currentMonth);
            BigDecimal totalMonths = BigDecimal.valueOf(12);
            for (BudgetLine line : lines) {
                BigDecimal projected = line.getActualAmount()
                        .divide(monthsElapsed, 4, RoundingMode.HALF_UP)
                        .multiply(totalMonths)
                        .setScale(2, RoundingMode.HALF_UP);
                line.setForecastAmount(projected);
            }
            budgetLineRepository.saveAll(lines);
        }

        budget.setUpdatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    private boolean matchesLine(Transaction t, BudgetLine line) {
        // Match by category if available, otherwise by type
        if (line.getCategoryId() != null && t.getCategoryId() != null) {
            return line.getCategoryId().equals(t.getCategoryId());
        }
        String txType = t.getType() == TransactionType.INCOME ? "INCOME" : "EXPENSE";
        return txType.equals(line.getType());
    }
}
