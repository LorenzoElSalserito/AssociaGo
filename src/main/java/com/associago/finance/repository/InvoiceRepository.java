package com.associago.finance.repository;

import com.associago.finance.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByAssociationId(Long associationId);
    List<Invoice> findByAssociationIdAndIsPaid(Long associationId, boolean isPaid);

    List<Invoice> findByAssociationIdOrderByNumberAsc(Long associationId);
}
