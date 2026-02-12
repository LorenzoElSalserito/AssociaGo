package com.associago.stats.dto;

import java.math.BigDecimal;

public class ActivityMonthlyDataDTO {
    private String month;
    private BigDecimal revenue;
    private BigDecimal costs;
    private BigDecimal profit;
    private Integer registrations;

    // Getters and Setters
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public BigDecimal getCosts() { return costs; }
    public void setCosts(BigDecimal costs) { this.costs = costs; }
    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }
    public Integer getRegistrations() { return registrations; }
    public void setRegistrations(Integer registrations) { this.registrations = registrations; }
}
