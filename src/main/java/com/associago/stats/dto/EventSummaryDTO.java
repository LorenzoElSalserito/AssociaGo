package com.associago.stats.dto;

import com.associago.event.Event;
import java.math.BigDecimal;
import java.util.List;

public class EventSummaryDTO {
    private Event event;
    private Integer registeredParticipants;
    private Integer checkedInParticipants;
    private BigDecimal totalRevenue;
    private Double attendanceRate;
    private Integer daysToEvent;
    private boolean isSoldOut;

    // Getters and Setters
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public Integer getRegisteredParticipants() { return registeredParticipants; }
    public void setRegisteredParticipants(Integer registeredParticipants) { this.registeredParticipants = registeredParticipants; }
    public Integer getCheckedInParticipants() { return checkedInParticipants; }
    public void setCheckedInParticipants(Integer checkedInParticipants) { this.checkedInParticipants = checkedInParticipants; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public Double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(Double attendanceRate) { this.attendanceRate = attendanceRate; }
    public Integer getDaysToEvent() { return daysToEvent; }
    public void setDaysToEvent(Integer daysToEvent) { this.daysToEvent = daysToEvent; }
    public boolean isSoldOut() { return isSoldOut; }
    public void setSoldOut(boolean soldOut) { isSoldOut = soldOut; }
}
