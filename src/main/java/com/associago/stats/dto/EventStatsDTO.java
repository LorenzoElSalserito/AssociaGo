package com.associago.stats.dto;

import java.math.BigDecimal;

public class EventStatsDTO {
    private Integer totalEvents;
    private Integer activeEvents;
    private Integer completedEvents;
    private Integer cancelledEvents;
    private Integer upcomingEvents;
    
    private Integer totalParticipants;
    private BigDecimal totalRevenue;
    private BigDecimal totalCosts;
    private BigDecimal netProfit;
    
    private Double averageParticipants;
    private Double attendanceRate;
    private BigDecimal averageRevenuePerEvent;

    // Getters and Setters
    public Integer getTotalEvents() { return totalEvents; }
    public void setTotalEvents(Integer totalEvents) { this.totalEvents = totalEvents; }
    public Integer getActiveEvents() { return activeEvents; }
    public void setActiveEvents(Integer activeEvents) { this.activeEvents = activeEvents; }
    public Integer getCompletedEvents() { return completedEvents; }
    public void setCompletedEvents(Integer completedEvents) { this.completedEvents = completedEvents; }
    public Integer getCancelledEvents() { return cancelledEvents; }
    public void setCancelledEvents(Integer cancelledEvents) { this.cancelledEvents = cancelledEvents; }
    public Integer getUpcomingEvents() { return upcomingEvents; }
    public void setUpcomingEvents(Integer upcomingEvents) { this.upcomingEvents = upcomingEvents; }
    public Integer getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(Integer totalParticipants) { this.totalParticipants = totalParticipants; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public BigDecimal getTotalCosts() { return totalCosts; }
    public void setTotalCosts(BigDecimal totalCosts) { this.totalCosts = totalCosts; }
    public BigDecimal getNetProfit() { return netProfit; }
    public void setNetProfit(BigDecimal netProfit) { this.netProfit = netProfit; }
    public Double getAverageParticipants() { return averageParticipants; }
    public void setAverageParticipants(Double averageParticipants) { this.averageParticipants = averageParticipants; }
    public Double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(Double attendanceRate) { this.attendanceRate = attendanceRate; }
    public BigDecimal getAverageRevenuePerEvent() { return averageRevenuePerEvent; }
    public void setAverageRevenuePerEvent(BigDecimal averageRevenuePerEvent) { this.averageRevenuePerEvent = averageRevenuePerEvent; }
}
