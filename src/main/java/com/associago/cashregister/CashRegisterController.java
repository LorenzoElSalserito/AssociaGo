package com.associago.cashregister;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cash-registers")
public class CashRegisterController {

    private final CashRegisterService cashRegisterService;

    public CashRegisterController(CashRegisterService cashRegisterService) {
        this.cashRegisterService = cashRegisterService;
    }

    @GetMapping
    public List<CashRegister> getAll(@RequestParam Long associationId) {
        return cashRegisterService.findByAssociation(associationId);
    }

    @GetMapping("/{id}")
    public CashRegister getById(@PathVariable Long id) {
        return cashRegisterService.findById(id);
    }

    @GetMapping("/open")
    public ResponseEntity<CashRegister> getOpen(@RequestParam Long associationId) {
        CashRegister open = cashRegisterService.findOpen(associationId);
        return open != null ? ResponseEntity.ok(open) : ResponseEntity.noContent().build();
    }

    @PostMapping("/open")
    public ResponseEntity<CashRegister> openRegister(@RequestParam Long associationId,
                                                      @RequestParam Long openedBy) {
        try {
            return ResponseEntity.ok(cashRegisterService.open(associationId, openedBy));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<CashRegister> closeRegister(@PathVariable Long id, @RequestParam Long closedBy) {
        try {
            return ResponseEntity.ok(cashRegisterService.close(id, closedBy));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- Entries ---

    @GetMapping("/{registerId}/entries")
    public List<CashRegisterEntry> getEntries(@PathVariable Long registerId) {
        return cashRegisterService.getEntries(registerId);
    }

    @PostMapping("/{registerId}/entries")
    public ResponseEntity<CashRegisterEntry> addEntry(@PathVariable Long registerId,
                                                       @RequestBody CashRegisterEntry entry) {
        try {
            entry.setCashRegisterId(registerId);
            return ResponseEntity.ok(cashRegisterService.addEntry(entry));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/entries/{entryId}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long entryId) {
        try {
            cashRegisterService.deleteEntry(entryId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
