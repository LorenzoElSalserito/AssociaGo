package com.associago.finance.fiscal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fiscal")
public class FiscalController {

    private final FiscalService fiscalService;

    @Autowired
    public FiscalController(FiscalService fiscalService) {
        this.fiscalService = fiscalService;
    }

    @PostMapping("/close-year")
    public ResponseEntity<FiscalYearClosure> closeFiscalYear(
            @RequestParam Long associationId,
            @RequestParam Integer year,
            @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(fiscalService.closeFiscalYear(associationId, year, userId));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build(); // Or return a specific error message
        }
    }

    @GetMapping("/closure")
    public ResponseEntity<FiscalYearClosure> getClosure(
            @RequestParam Long associationId,
            @RequestParam Integer year) {
        return fiscalService.getFiscalYearClosure(associationId, year)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/invoice-check")
    public ResponseEntity<InvoiceCheck> runInvoiceCheck(
            @RequestParam Long associationId,
            @RequestParam Integer year,
            @RequestParam Long userId) {
        return ResponseEntity.ok(fiscalService.performInvoiceCheck(associationId, year, userId));
    }
}
