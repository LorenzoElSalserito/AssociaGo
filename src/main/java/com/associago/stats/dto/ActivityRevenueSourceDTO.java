package com.associago.stats.dto;

import java.math.BigDecimal;

public class ActivityRevenueSourceDTO {
    private String source; // "REGISTRATIONS", "DISCOUNTS", "COUPONS"
    private BigDecimal amount;
    private Double percentage;
    private Integer count;

    // Getters and Setters
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }
}
