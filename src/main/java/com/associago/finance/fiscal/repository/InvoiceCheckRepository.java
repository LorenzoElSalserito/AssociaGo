package com.associago.finance.fiscal.repository;

import com.associago.finance.fiscal.InvoiceCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceCheckRepository extends JpaRepository<InvoiceCheck, Long> {
    List<InvoiceCheck> findByAssociationId(Long associationId);
    List<InvoiceCheck> findByAssociationIdAndYear(Long associationId, Integer year);
}
