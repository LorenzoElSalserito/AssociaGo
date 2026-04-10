package com.associago.cashregister;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CashRegisterService {

    private final CashRegisterRepository registerRepository;
    private final CashRegisterEntryRepository entryRepository;

    public CashRegisterService(CashRegisterRepository registerRepository,
                               CashRegisterEntryRepository entryRepository) {
        this.registerRepository = registerRepository;
        this.entryRepository = entryRepository;
    }

    public List<CashRegister> findByAssociation(Long associationId) {
        return registerRepository.findByAssociationIdOrderByDateDesc(associationId);
    }

    public CashRegister findById(Long id) {
        return registerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cash register not found: " + id));
    }

    public CashRegister findOpen(Long associationId) {
        return registerRepository.findFirstByAssociationIdAndStatusOrderByDateDesc(associationId, "OPEN")
                .orElse(null);
    }

    /**
     * Opens a new daily cash register. The opening balance carries over from the
     * last closed register's closing balance.
     */
    @Transactional
    public CashRegister open(Long associationId, Long openedBy) {
        // Check if there's already an open register
        CashRegister existing = findOpen(associationId);
        if (existing != null) {
            throw new IllegalStateException("Cash register for " + existing.getDate() + " is still open. Close it first.");
        }

        LocalDate today = LocalDate.now();
        BigDecimal openingBalance = BigDecimal.ZERO;

        // Carry over from last closed register
        registerRepository.findByAssociationIdAndDate(associationId, today.minusDays(1))
                .ifPresent(prev -> {
                    // can't assign directly to openingBalance, handled below
                });

        // Find most recent closed register for carryover
        List<CashRegister> recent = registerRepository.findByAssociationIdOrderByDateDesc(associationId);
        for (CashRegister r : recent) {
            if ("CLOSED".equals(r.getStatus()) || "RECONCILED".equals(r.getStatus())) {
                if (r.getClosingBalance() != null) {
                    openingBalance = r.getClosingBalance();
                }
                break;
            }
        }

        CashRegister register = new CashRegister();
        register.setAssociationId(associationId);
        register.setDate(today);
        register.setOpenedBy(openedBy);
        register.setOpeningBalance(openingBalance);
        register.setStatus("OPEN");
        register.setOpenedAt(LocalDateTime.now());
        return registerRepository.save(register);
    }

    /**
     * Closes the register for the day, computing totals and closing balance.
     */
    @Transactional
    public CashRegister close(Long registerId, Long closedBy) {
        CashRegister register = findById(registerId);
        if (!"OPEN".equals(register.getStatus())) {
            throw new IllegalStateException("Register is not open.");
        }

        List<CashRegisterEntry> entries = entryRepository.findByCashRegisterIdOrderByTimeAsc(registerId);

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        for (CashRegisterEntry entry : entries) {
            if ("INCOME".equals(entry.getType())) {
                income = income.add(entry.getAmount());
            } else {
                expense = expense.add(entry.getAmount());
            }
        }

        register.setTotalIncome(income);
        register.setTotalExpense(expense);
        register.setClosingBalance(register.getOpeningBalance().add(income).subtract(expense));
        register.setClosedBy(closedBy);
        register.setClosedAt(LocalDateTime.now());
        register.setStatus("CLOSED");
        register.setUpdatedAt(LocalDateTime.now());
        return registerRepository.save(register);
    }

    // --- Entries ---

    public List<CashRegisterEntry> getEntries(Long registerId) {
        return entryRepository.findByCashRegisterIdOrderByTimeAsc(registerId);
    }

    @Transactional
    public CashRegisterEntry addEntry(CashRegisterEntry entry) {
        CashRegister register = findById(entry.getCashRegisterId());
        if (!"OPEN".equals(register.getStatus())) {
            throw new IllegalStateException("Cannot add entries to a closed register.");
        }
        entry.setTime(LocalDateTime.now());
        return entryRepository.save(entry);
    }

    @Transactional
    public void deleteEntry(Long entryId) {
        CashRegisterEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Entry not found: " + entryId));
        CashRegister register = findById(entry.getCashRegisterId());
        if (!"OPEN".equals(register.getStatus())) {
            throw new IllegalStateException("Cannot remove entries from a closed register.");
        }
        entryRepository.deleteById(entryId);
    }
}
