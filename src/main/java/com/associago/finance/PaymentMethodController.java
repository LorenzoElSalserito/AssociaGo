package com.associago.finance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getAll(@RequestParam Long associationId) {
        return ResponseEntity.ok(paymentMethodService.getAllByAssociation(associationId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<PaymentMethod>> getActive(@RequestParam Long associationId) {
        return ResponseEntity.ok(paymentMethodService.getActiveByAssociation(associationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentMethod> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentMethodService.getById(id));
    }

    @PostMapping
    public ResponseEntity<PaymentMethod> create(@RequestBody PaymentMethod paymentMethod) {
        return ResponseEntity.ok(paymentMethodService.create(paymentMethod));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMethod> update(@PathVariable Long id, @RequestBody PaymentMethod paymentMethod) {
        return ResponseEntity.ok(paymentMethodService.update(id, paymentMethod));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentMethodService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
