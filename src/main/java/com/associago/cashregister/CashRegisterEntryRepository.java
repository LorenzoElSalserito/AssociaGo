package com.associago.cashregister;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CashRegisterEntryRepository extends JpaRepository<CashRegisterEntry, Long> {
    List<CashRegisterEntry> findByCashRegisterIdOrderByTimeAsc(Long cashRegisterId);
}
