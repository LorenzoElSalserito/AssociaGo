package com.associago.finance.repository;

import com.associago.finance.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByAssociationId(Long associationId);
    List<PaymentMethod> findByAssociationIdAndIsActiveTrue(Long associationId);
    Optional<PaymentMethod> findByNameAndAssociationId(String name, Long associationId);
}
