package com.associago.finance.fiscal;

import com.associago.finance.TransactionType;
import com.associago.finance.fiscal.repository.FiscalComparisonRepository;
import com.associago.finance.fiscal.repository.FiscalYearClosureRepository;
import com.associago.finance.fiscal.repository.InvoiceCheckRepository;
import com.associago.finance.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class FiscalService {

    private final FiscalYearClosureRepository closureRepository;
    private final FiscalComparisonRepository comparisonRepository;
    private final InvoiceCheckRepository invoiceCheckRepository;
    private final TransactionRepository transactionRepository;

    @Autowired
    public FiscalService(FiscalYearClosureRepository closureRepository,
                         FiscalComparisonRepository comparisonRepository,
                         InvoiceCheckRepository invoiceCheckRepository,
                         TransactionRepository transactionRepository) {
        this.closureRepository = closureRepository;
        this.comparisonRepository = comparisonRepository;
        this.invoiceCheckRepository = invoiceCheckRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public FiscalYearClosure closeFiscalYear(Long associationId, Integer year, Long userId) {
        Optional<FiscalYearClosure> existing = closureRepository.findByAssociationIdAndYear(associationId, year);
        if (existing.isPresent() && "CLOSED".equals(existing.get().getStatus())) {
            throw new IllegalStateException("Fiscal year " + year + " is already closed.");
        }

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        BigDecimal income = transactionRepository.sumByTypeAndDateRange(TransactionType.INCOME, startDate, endDate);
        BigDecimal expenses = transactionRepository.sumByTypeAndDateRange(TransactionType.EXPENSE, startDate, endDate);
        
        if (income == null) income = BigDecimal.ZERO;
        if (expenses == null) expenses = BigDecimal.ZERO;

        FiscalYearClosure closure = existing.orElse(new FiscalYearClosure());
        closure.setAssociationId(associationId);
        closure.setYear(year);
        closure.setTotalIncome(income);
        closure.setTotalExpenses(expenses);
        closure.setNetBalance(income.subtract(expenses));
        closure.setStatus("CLOSED");
        closure.setClosedBy(userId);
        closure.setClosedAt(LocalDateTime.now());
        
        // Members count logic would go here (need to inject MembershipService or Repository)
        
        return closureRepository.save(closure);
    }

    public Optional<FiscalYearClosure> getFiscalYearClosure(Long associationId, Integer year) {
        return closureRepository.findByAssociationIdAndYear(associationId, year);
    }
    
    // Placeholder for Invoice Check Logic
    @Transactional
    public InvoiceCheck performInvoiceCheck(Long associationId, Integer year, Long userId) {
        // This would involve complex logic checking invoice sequences, etc.
        // For now, we create a dummy check record.
        InvoiceCheck check = new InvoiceCheck();
        check.setAssociationId(associationId);
        check.setYear(year);
        check.setCheckedBy(userId);
        check.setCheckDate(LocalDateTime.now());
        // ... populate other fields with real logic
        return invoiceCheckRepository.save(check);
    }
}
