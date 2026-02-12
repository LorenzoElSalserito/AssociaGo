package com.associago.stats.dto;

import com.associago.activity.Activity;
import com.associago.activity.ActivityCost;
import com.associago.activity.ActivityInstructor;
import com.associago.activity.ActivityParticipant;

import java.math.BigDecimal;
import java.util.List;

public class ActivityWithDetailsDTO {
    private Activity activity;
    private Integer totalParticipants;
    private Integer activeParticipants;
    private Integer pendingParticipants;
    private Integer waitingListCount;
    
    private BigDecimal totalRevenue;
    private BigDecimal paidRevenue;
    private BigDecimal pendingRevenue;
    private BigDecimal totalCosts;
    private BigDecimal netProfit;
    
    private Double completionPercentage;
    private Integer daysRemaining;
    private boolean isExpiringSoon;
    private Integer availableSpots;
    
    private List<ActivityInstructor> instructors;
    private List<ActivityParticipant> recentParticipants;
    private List<ActivityCostSummaryDTO> topCostCategories;
    
    private ActivityPaymentStatusDTO paymentStatus;
    private ActivityPerformanceMetricsDTO performanceMetrics;

    // Getters and Setters
    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }
    public Integer getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(Integer totalParticipants) { this.totalParticipants = totalParticipants; }
    public Integer getActiveParticipants() { return activeParticipants; }
    public void setActiveParticipants(Integer activeParticipants) { this.activeParticipants = activeParticipants; }
    public Integer getPendingParticipants() { return pendingParticipants; }
    public void setPendingParticipants(Integer pendingParticipants) { this.pendingParticipants = pendingParticipants; }
    public Integer getWaitingListCount() { return waitingListCount; }
    public void setWaitingListCount(Integer waitingListCount) { this.waitingListCount = waitingListCount; }
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
    public Double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }
    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }
    public boolean isExpiringSoon() { return isExpiringSoon; }
    public void setExpiringSoon(boolean expiringSoon) { isExpiringSoon = expiringSoon; }
    public Integer getAvailableSpots() { return availableSpots; }
    public void setAvailableSpots(Integer availableSpots) { this.availableSpots = availableSpots; }
    public List<ActivityInstructor> getInstructors() { return instructors; }
    public void setInstructors(List<ActivityInstructor> instructors) { this.instructors = instructors; }
    public List<ActivityParticipant> getRecentParticipants() { return recentParticipants; }
    public void setRecentParticipants(List<ActivityParticipant> recentParticipants) { this.recentParticipants = recentParticipants; }
    public List<ActivityCostSummaryDTO> getTopCostCategories() { return topCostCategories; }
    public void setTopCostCategories(List<ActivityCostSummaryDTO> topCostCategories) { this.topCostCategories = topCostCategories; }
    public ActivityPaymentStatusDTO getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(ActivityPaymentStatusDTO paymentStatus) { this.paymentStatus = paymentStatus; }
    public ActivityPerformanceMetricsDTO getPerformanceMetrics() { return performanceMetrics; }
    public void setPerformanceMetrics(ActivityPerformanceMetricsDTO performanceMetrics) { this.performanceMetrics = performanceMetrics; }
}
