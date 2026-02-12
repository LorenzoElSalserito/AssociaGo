package com.associago.stats.dto;

import java.math.BigDecimal;
import java.util.List;

public class ActivityFinancialSummaryDTO {
    private Long activityId;
    private String activityName;
    private BigDecimal totalRevenue;
    private BigDecimal paidRevenue;
    private BigDecimal pendingRevenue;
    private BigDecimal totalCosts;
    private BigDecimal netProfit;
    private Double profitMargin;
    private Integer participantsCount;
    private BigDecimal averageFeePerUser;
    
    private List<ActivityCostSummaryDTO> costBreakdown;
    private List<ActivityRevenueSourceDTO> revenueBreakdown;
    private List<ActivityMonthlyDataDTO> monthlyTrend;

    // Getters and Setters
    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }
    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public BigDecimal getPaidRevenue() { return paidRevenue; }
    public void setPaidRevenue(BigDecimal paidRevenue) { this.paidRevenue = paidRevenue; }
    public BigDecimal getPendingRevenue() { return pendingRevenue; }
    public void setPendingRevenue(BigDecimal pendingRevenue) { this.pendingRevenue = pendingRevenue; }
    public BigDecimal getTotalCosts() { return totalCosts; }
    public void setTotalCosts(BigDecimal totalCosts) { this.totalCosts = totalCosts; }
    public BigDecimal getNetProfit() { return netProfit; }
    public void setNetProfit(BigDecimal netProfit) { this.netProfit = netProfit; }
    public Double getProfitMargin() { return profitMargin; }
    public void setProfitMargin(Double profitMargin) { this.profitMargin = profitMargin; }
    public Integer getParticipantsCount() { return participantsCount; }
    public void setParticipantsCount(Integer participantsCount) { this.participantsCount = participantsCount; }
    public BigDecimal getAverageFeePerUser() { return averageFeePerUser; }
    public void setAverageFeePerUser(BigDecimal averageFeePerUser) { this.averageFeePerUser = averageFeePerUser; }
    public List<ActivityCostSummaryDTO> getCostBreakdown() { return costBreakdown; }
    public void setCostBreakdown(List<ActivityCostSummaryDTO> costBreakdown) { this.costBreakdown = costBreakdown; }
    public List<ActivityRevenueSourceDTO> getRevenueBreakdown() { return revenueBreakdown; }
    public void setRevenueBreakdown(List<ActivityRevenueSourceDTO> revenueBreakdown) { this.revenueBreakdown = revenueBreakdown; }
    public List<ActivityMonthlyDataDTO> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<ActivityMonthlyDataDTO> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
}
