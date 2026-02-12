package com.associago.inventory.repository;

import com.associago.inventory.InventoryLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryLoanRepository extends JpaRepository<InventoryLoan, Long> {
    List<InventoryLoan> findByItemId(Long itemId);
    List<InventoryLoan> findByUserAssociationId(Long userAssociationId);
}
