package com.associago.finance.fiscal;

import com.associago.finance.Invoice;
import com.associago.finance.TransactionType;
import com.associago.finance.fiscal.repository.FiscalComparisonRepository;
import com.associago.finance.fiscal.repository.FiscalYearClosureRepository;
import com.associago.finance.fiscal.repository.InvoiceCheckRepository;
import com.associago.finance.repository.InvoiceRepository;
import com.associago.finance.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FiscalService {

    private final FiscalYearClosureRepository closureRepository;
    private final FiscalComparisonRepository comparisonRepository;
    private final InvoiceCheckRepository invoiceCheckRepository;
    private final TransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;

    @Autowired
    public FiscalService(FiscalYearClosureRepository closureRepository,
                         FiscalComparisonRepository comparisonRepository,
                         InvoiceCheckRepository invoiceCheckRepository,
                         TransactionRepository transactionRepository,
                         InvoiceRepository invoiceRepository) {
        this.closureRepository = closureRepository;
        this.comparisonRepository = comparisonRepository;
        this.invoiceCheckRepository = invoiceCheckRepository;
        this.transactionRepository = transactionRepository;
        this.invoiceRepository = invoiceRepository;
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
    
    @Transactional
    public InvoiceCheck performInvoiceCheck(Long associationId, Integer year, Long userId) {
        List<Invoice> allInvoices = invoiceRepository.findByAssociationIdOrderByNumberAsc(associationId);

        // Filter by year based on issueDate
        List<Invoice> yearInvoices = allInvoices.stream()
                .filter(inv -> inv.getIssueDate() != null && inv.getIssueDate().getYear() == year)
                .filter(inv -> !inv.isCancelled())
                .toList();

        InvoiceCheck check = new InvoiceCheck();
        check.setAssociationId(associationId);
        check.setYear(year);
        check.setCheckedBy(userId);
        check.setCheckDate(LocalDateTime.now());
        check.setTotalInvoices(yearInvoices.size());

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal overdueAmount = BigDecimal.ZERO;
        int overdueCount = 0;
        List<String> numberingIssues = new ArrayList<>();
        List<String> paymentIssues = new ArrayList<>();

        String lastNumber = null;
        for (Invoice inv : yearInvoices) {
            totalAmount = totalAmount.add(inv.getAmount() != null ? inv.getAmount() : BigDecimal.ZERO);

            if (inv.isPaid()) {
                totalCollected = totalCollected.add(inv.getAmount() != null ? inv.getAmount() : BigDecimal.ZERO);
            } else if (inv.getDueDate() != null && inv.getDueDate().isBefore(LocalDate.now())) {
                overdueCount++;
                overdueAmount = overdueAmount.add(inv.getAmount() != null ? inv.getAmount() : BigDecimal.ZERO);
                paymentIssues.add("Fattura " + inv.getNumber() + " scaduta il " + inv.getDueDate());
            }

            // Numbering sequence check
            if (lastNumber != null && inv.getNumber() != null) {
                try {
                    String numPart = inv.getNumber().replaceAll("[^0-9]", "");
                    String lastNumPart = lastNumber.replaceAll("[^0-9]", "");
                    if (!numPart.isEmpty() && !lastNumPart.isEmpty()) {
                        int current = Integer.parseInt(numPart);
                        int last = Integer.parseInt(lastNumPart);
                        if (current != last + 1 && current != last) {
                            numberingIssues.add("Gap numerazione tra " + lastNumber + " e " + inv.getNumber());
                        }
                    }
                } catch (NumberFormatException e) {
                    // Non-numeric numbering, skip sequence check
                }
            }
            lastNumber = inv.getNumber();
        }

        check.setTotalAmount(totalAmount);
        check.setTotalCollected(totalCollected);
        check.setTotalOutstanding(totalAmount.subtract(totalCollected));
        check.setOverdueCount(overdueCount);
        check.setOverdueAmount(overdueAmount);
        check.setNumberingOk(numberingIssues.isEmpty());
        check.setNumberingIssues(numberingIssues.isEmpty() ? null : String.join("; ", numberingIssues));
        check.setPaymentOk(paymentIssues.isEmpty());
        check.setPaymentIssues(paymentIssues.isEmpty() ? null : String.join("; ", paymentIssues));

        return invoiceCheckRepository.save(check);
    }

    public List<InvoiceCheck> getInvoiceCheckHistory(Long associationId) {
        return invoiceCheckRepository.findByAssociationIdOrderByCheckDateDesc(associationId);
    }
}
