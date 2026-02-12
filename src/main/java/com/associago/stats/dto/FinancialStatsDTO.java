package com.associago.stats.dto;

import java.math.BigDecimal;
import java.util.Map;

public class FinancialStatsDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;
    private Map<String, BigDecimal> incomeByCategory;
    private Map<String, BigDecimal> expensesByCategory;
    private Map<String, BigDecimal> incomeByPaymentMethod;

    // Getters and Setters
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getNetBalance() { return netBalance; }
    public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }
    public Map<String, BigDecimal> getIncomeByCategory() { return incomeByCategory; }
    public void setIncomeByCategory(Map<String, BigDecimal> incomeByCategory) { this.incomeByCategory = incomeByCategory; }
    public Map<String, BigDecimal> getExpensesByCategory() { return expensesByCategory; }
    public void setExpensesByCategory(Map<String, BigDecimal> expensesByCategory) { this.expensesByCategory = expensesByCategory; }
    public Map<String, BigDecimal> getIncomeByPaymentMethod() { return incomeByPaymentMethod; }
    public void setIncomeByPaymentMethod(Map<String, BigDecimal> incomeByPaymentMethod) { this.incomeByPaymentMethod = incomeByPaymentMethod; }
}
