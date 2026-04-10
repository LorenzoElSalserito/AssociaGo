package com.associago.cashregister;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CashRegisterRepository extends JpaRepository<CashRegister, Long> {
    List<CashRegister> findByAssociationIdOrderByDateDesc(Long associationId);
    Optional<CashRegister> findByAssociationIdAndDate(Long associationId, LocalDate date);
    Optional<CashRegister> findFirstByAssociationIdAndStatusOrderByDateDesc(Long associationId, String status);
}
