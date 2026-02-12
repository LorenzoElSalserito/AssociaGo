package com.associago.inventory;

import com.associago.finance.FinancialService;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.inventory.repository.InventoryItemRepository;
import com.associago.inventory.repository.InventoryLoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryItemRepository itemRepository;
    private final InventoryLoanRepository loanRepository;
    private final FinancialService financialService;

    public InventoryService(InventoryItemRepository itemRepository, InventoryLoanRepository loanRepository, FinancialService financialService) {
        this.itemRepository = itemRepository;
        this.loanRepository = loanRepository;
        this.financialService = financialService;
    }

    public Iterable<InventoryItem> getAllItems() {
        Iterable<InventoryItem> items = itemRepository.findAll();
        items.forEach(this::calculateDepreciation);
        return items;
    }

    public Optional<InventoryItem> getItemById(Long id) {
        Optional<InventoryItem> itemOpt = itemRepository.findById(id);
        itemOpt.ifPresent(this::calculateDepreciation);
        return itemOpt;
    }

    @Transactional
    public InventoryItem createItem(InventoryItem item) {
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        if (item.getStatus() == null) {
            item.setStatus("AVAILABLE");
        }
        
        InventoryItem savedItem = itemRepository.save(item);

        // Auto-create transaction if purchased
        if ("PURCHASE".equals(item.getAcquisitionMethod()) && 
            item.getPurchasePrice() != null && 
            item.getPurchasePrice().compareTo(BigDecimal.ZERO) > 0) {
            
            Transaction transaction = new Transaction();
            transaction.setAssociationId(item.getAssociationId());
            transaction.setDate(item.getPurchaseDate() != null ? item.getPurchaseDate() : java.time.LocalDate.now());
            transaction.setAmount(item.getPurchasePrice());
            transaction.setType(TransactionType.EXPENSE);
            transaction.setDescription("Purchase: " + item.getName());
            transaction.setInventoryItemId(savedItem.getId());
            transaction.setCategory("Inventory"); // Simple string or ID if category management exists
            
            financialService.saveTransaction(transaction);
        }

        return savedItem;
    }

    @Transactional
    public InventoryItem updateItem(Long id, InventoryItem itemDetails) {
        return itemRepository.findById(id).map(item -> {
            item.setName(itemDetails.getName());
            item.setDescription(itemDetails.getDescription());
            item.setCategory(itemDetails.getCategory());
            item.setQuantity(itemDetails.getQuantity());
            item.setLocation(itemDetails.getLocation());
            item.setAcquisitionMethod(itemDetails.getAcquisitionMethod());
            item.setPurchaseDate(itemDetails.getPurchaseDate());
            item.setPurchasePrice(itemDetails.getPurchasePrice());
            item.setDepreciationYears(itemDetails.getDepreciationYears());
            item.setCondition(itemDetails.getCondition());
            item.setStatus(itemDetails.getStatus());
            item.setUpdatedAt(LocalDateTime.now());
            return itemRepository.save(item);
        }).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    // Loans
    public List<InventoryLoan> getLoansByItem(Long itemId) {
        return loanRepository.findByItemId(itemId);
    }

    @Transactional
    public InventoryLoan createLoan(InventoryLoan loan) {
        loan.setLoanDate(LocalDateTime.now());
        if (loan.getStatus() == null) {
            loan.setStatus("ACTIVE");
        }
        // Update item status if needed (e.g., decrease quantity or set to LOANED)
        return loanRepository.save(loan);
    }

    @Transactional
    public InventoryLoan returnLoan(Long loanId, LocalDateTime returnDate) {
        return loanRepository.findById(loanId).map(loan -> {
            loan.setActualReturnDate(returnDate != null ? returnDate : LocalDateTime.now());
            loan.setStatus("RETURNED");
            return loanRepository.save(loan);
        }).orElseThrow(() -> new RuntimeException("Loan not found"));
    }

    // Depreciation Logic
    private void calculateDepreciation(InventoryItem item) {
        if (item.getPurchasePrice() == null || item.getPurchaseDate() == null || item.getDepreciationYears() == null || item.getDepreciationYears() <= 0) {
            item.setCurrentValue(item.getPurchasePrice());
            return;
        }

        LocalDate now = LocalDate.now();
        long yearsPassed = ChronoUnit.YEARS.between(item.getPurchaseDate(), now);

        if (yearsPassed >= item.getDepreciationYears()) {
            item.setCurrentValue(BigDecimal.ZERO);
        } else {
            BigDecimal annualDepreciation = item.getPurchasePrice().divide(BigDecimal.valueOf(item.getDepreciationYears()), 2, RoundingMode.HALF_UP);
            BigDecimal totalDepreciation = annualDepreciation.multiply(BigDecimal.valueOf(yearsPassed));
            BigDecimal currentValue = item.getPurchasePrice().subtract(totalDepreciation);
            item.setCurrentValue(currentValue.max(BigDecimal.ZERO));
        }
    }
}
