package com.associago.balance;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "annual_balance_lines")
public class AnnualBalanceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "balance_id", nullable = false)
    private Long balanceId;

    @Column(nullable = false)
    private String section; // INCOME, EXPENSE, ASSET, LIABILITY

    @Column(name = "category_id")
    private Long categoryId;

    @Column(nullable = false)
    private String label;

    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "previous_year_amount")
    private BigDecimal previousYearAmount = BigDecimal.ZERO;

    private BigDecimal variance = BigDecimal.ZERO;

    @Column(name = "variance_pct")
    private BigDecimal variancePct = BigDecimal.ZERO;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_subtotal")
    private boolean subtotal = false;

    private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBalanceId() { return balanceId; }
    public void setBalanceId(Long balanceId) { this.balanceId = balanceId; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getPreviousYearAmount() { return previousYearAmount; }
    public void setPreviousYearAmount(BigDecimal previousYearAmount) { this.previousYearAmount = previousYearAmount; }
    public BigDecimal getVariance() { return variance; }
    public void setVariance(BigDecimal variance) { this.variance = variance; }
    public BigDecimal getVariancePct() { return variancePct; }
    public void setVariancePct(BigDecimal variancePct) { this.variancePct = variancePct; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public boolean isSubtotal() { return subtotal; }
    public void setSubtotal(boolean subtotal) { this.subtotal = subtotal; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
