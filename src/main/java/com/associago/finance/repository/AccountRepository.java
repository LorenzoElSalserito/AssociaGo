package com.associago.finance.repository;

import com.associago.finance.Account;
import com.associago.finance.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByAssociationId(Long associationId);
    List<Account> findByAssociationIdAndType(Long associationId, AccountType type);
    Optional<Account> findByAssociationIdAndCode(Long associationId, String code);
}
