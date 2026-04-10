package com.associago.balance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnualBalanceLineRepository extends JpaRepository<AnnualBalanceLine, Long> {
    List<AnnualBalanceLine> findByBalanceIdOrderBySortOrder(Long balanceId);
    void deleteByBalanceId(Long balanceId);
}
