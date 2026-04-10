package com.associago.budget;

import com.associago.budget.dto.BudgetDTO;
import com.associago.budget.dto.BudgetLineDTO;
import com.associago.budget.dto.BudgetLineUpsertDTO;
import com.associago.budget.dto.BudgetUpsertDTO;
import com.associago.budget.mapper.BudgetMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public List<BudgetDTO> getAll(@RequestParam Long associationId) {
        return budgetService.findByAssociation(associationId).stream()
                .map(BudgetMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public BudgetDTO getById(@PathVariable Long id) {
        return BudgetMapper.toDTO(budgetService.findById(id));
    }

    @PostMapping
    public BudgetDTO create(@RequestBody BudgetUpsertDTO budget) {
        Budget entity = BudgetMapper.toEntity(budget);
        return BudgetMapper.toDTO(budgetService.create(entity));
    }

    @PutMapping("/{id}")
    public BudgetDTO update(@PathVariable Long id, @RequestBody BudgetUpsertDTO budget) {
        Budget entity = budgetService.findById(id);
        BudgetMapper.updateEntity(entity, budget);
        return BudgetMapper.toDTO(budgetService.update(id, entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public BudgetDTO approve(@PathVariable Long id, @RequestParam Long approvedBy) {
        return BudgetMapper.toDTO(budgetService.approve(id, approvedBy));
    }

    @PostMapping("/{id}/sync-actuals")
    public BudgetDTO syncActuals(@PathVariable Long id) {
        return BudgetMapper.toDTO(budgetService.syncActuals(id));
    }

    // --- Budget Lines ---

    @GetMapping("/{budgetId}/lines")
    public List<BudgetLineDTO> getLines(@PathVariable Long budgetId) {
        return budgetService.getLines(budgetId).stream()
                .map(BudgetMapper::toDTO)
                .toList();
    }

    @PostMapping("/{budgetId}/lines")
    public BudgetLineDTO addLine(@PathVariable Long budgetId, @RequestBody BudgetLineUpsertDTO line) {
        BudgetLine entity = new BudgetLine();
        BudgetMapper.updateLineEntity(entity, line);
        entity.setBudgetId(budgetId);
        return BudgetMapper.toDTO(budgetService.addLine(entity));
    }

    @PutMapping("/lines/{lineId}")
    public BudgetLineDTO updateLine(@PathVariable Long lineId, @RequestBody BudgetLineUpsertDTO line) {
        BudgetLine entity = budgetService.findLineById(lineId);
        BudgetMapper.updateLineEntity(entity, line);
        return BudgetMapper.toDTO(budgetService.updateLine(lineId, entity));
    }

    @DeleteMapping("/lines/{lineId}")
    public ResponseEntity<Void> deleteLine(@PathVariable Long lineId) {
        budgetService.deleteLine(lineId);
        return ResponseEntity.noContent().build();
    }
}
