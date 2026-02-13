package com.associago.finance;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import jakarta.persistence.criteria.Predicate;

@RestController
@RequestMapping("/api/v1/finance")
public class FinancialController {

    private final FinancialService financialService;

    @Autowired
    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @PostMapping("/transactions")
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return financialService.saveTransaction(transaction);
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction) {
        try {
            return ResponseEntity.ok(financialService.updateTransaction(id, transaction));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        financialService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) Long activityId,
            @RequestParam(required = false) Long membershipId,
            @RequestParam(required = false) Long inventoryItemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Specification<Transaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }
            if (eventId != null) {
                predicates.add(cb.equal(root.get("eventId"), eventId));
            }
            if (activityId != null) {
                predicates.add(cb.equal(root.get("activityId"), activityId));
            }
            if (membershipId != null) {
                predicates.add(cb.equal(root.get("membershipId"), membershipId));
            }
            if (inventoryItemId != null) {
                predicates.add(cb.equal(root.get("inventoryItemId"), inventoryItemId));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return financialService.getTransactions(spec);
    }

    @GetMapping("/journal-entries")
    public List<JournalEntry> getJournalEntries(
            @RequestParam(required = false) Long associationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return financialService.getJournalEntries(associationId, startDate, endDate);
    }

    @GetMapping("/yoy-comparison")
    public ResponseEntity<Map<String, BigDecimal>> getYoyComparison(@RequestParam(defaultValue = "2024") int year) {
        return ResponseEntity.ok(financialService.getYearOverYearComparison(year));
    }

    @GetMapping("/comparison")
    public ResponseEntity<Map<String, BigDecimal>> getCustomComparison(
            @RequestParam int year1,
            @RequestParam int year2
    ) {
        return ResponseEntity.ok(financialService.getCustomComparison(year1, year2));
    }
}
