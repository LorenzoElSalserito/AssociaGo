package com.associago.inventory;

import com.associago.inventory.dto.InventoryItemCreateDTO;
import com.associago.inventory.dto.InventoryItemDTO;
import com.associago.inventory.mapper.InventoryItemMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemDTO>> getAllItems() {
        List<InventoryItemDTO> items = StreamSupport.stream(inventoryService.getAllItems().spliterator(), false)
                .map(InventoryItemMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> getItemById(@PathVariable Long id) {
        return inventoryService.getItemById(id)
                .map(InventoryItemMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InventoryItemDTO> createItem(@Valid @RequestBody InventoryItemCreateDTO dto) {
        InventoryItem item = InventoryItemMapper.toEntity(dto);
        InventoryItem saved = inventoryService.createItem(item);
        return ResponseEntity.ok(InventoryItemMapper.toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> updateItem(@PathVariable Long id,
                                                        @Valid @RequestBody InventoryItemCreateDTO dto) {
        return inventoryService.getItemById(id)
                .map(existing -> {
                    InventoryItemMapper.updateEntity(existing, dto);
                    InventoryItem saved = inventoryService.updateItem(id, existing);
                    return ResponseEntity.ok(InventoryItemMapper.toDTO(saved));
                })
                .orElse(ResponseEntity.notFound().build());
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
