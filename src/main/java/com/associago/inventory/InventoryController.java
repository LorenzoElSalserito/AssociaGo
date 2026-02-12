package com.associago.inventory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<Iterable<InventoryItem>> getAllItems() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItem> getItemById(@PathVariable Long id) {
        return inventoryService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InventoryItem> createItem(@RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryService.createItem(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @RequestBody InventoryItem item) {
        try {
            return ResponseEntity.ok(inventoryService.updateItem(id, item));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/loans")
    public ResponseEntity<List<InventoryLoan>> getLoansByItem(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getLoansByItem(id));
    }

    @PostMapping("/loans")
    public ResponseEntity<InventoryLoan> createLoan(@RequestBody InventoryLoan loan) {
        return ResponseEntity.ok(inventoryService.createLoan(loan));
    }

    @PutMapping("/loans/{id}/return")
    public ResponseEntity<InventoryLoan> returnLoan(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(inventoryService.returnLoan(id, LocalDateTime.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
