package com.associago.finance.repository;

import com.associago.finance.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByAssociationIdAndDateBetween(Long associationId, LocalDate startDate, LocalDate endDate);
    List<JournalEntry> findByTransactionId(Long transactionId);
}
