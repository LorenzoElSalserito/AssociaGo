package com.associago.stats.dto;

public class ActivityPerformanceMetricsDTO {
    private Double occupancyRate;
    private Double dropOutRate;
    private Double averageSatisfaction;
    private Integer averageRegistrationDays;

    // Getters and Setters
    public Double getOccupancyRate() { return occupancyRate; }
    public void setOccupancyRate(Double occupancyRate) { this.occupancyRate = occupancyRate; }
    public Double getDropOutRate() { return dropOutRate; }
    public void setDropOutRate(Double dropOutRate) { this.dropOutRate = dropOutRate; }
    public Double getAverageSatisfaction() { return averageSatisfaction; }
    public void setAverageSatisfaction(Double averageSatisfaction) { this.averageSatisfaction = averageSatisfaction; }
    public Integer getAverageRegistrationDays() { return averageRegistrationDays; }
    public void setAverageRegistrationDays(Integer averageRegistrationDays) { this.averageRegistrationDays = averageRegistrationDays; }
}
