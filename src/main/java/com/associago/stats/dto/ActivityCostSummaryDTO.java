package com.associago.stats.dto;

import java.math.BigDecimal;

public class ActivityCostSummaryDTO {
    private String category;
    private BigDecimal totalAmount;
    private Integer count;
    private Double percentage;

    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
}
