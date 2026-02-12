package com.associago.volunteer;

import com.associago.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_shifts")
public class VolunteerShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "volunteer_id")
    private Long volunteerId;
    
    @Column(name = "event_id")
    private Long eventId;
    
    @Column(name = "activity_id")
    private Long activityId;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    private String role;
    
    @Column(name = "hours_worked")
    private BigDecimal hoursWorked;

    private String status; // SCHEDULED, COMPLETED, MISSED

    // --- Campi Aggiunti ---
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "hourly_value")
    private BigDecimal hourlyValue; // Per bilancio sociale

    @ManyToOne
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    // --- Fine Campi Aggiunti ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public BigDecimal getHoursWorked() { return hoursWorked; }
    public void setHoursWorked(BigDecimal hoursWorked) { this.hoursWorked = hoursWorked; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getHourlyValue() { return hourlyValue; }
    public void setHourlyValue(BigDecimal hourlyValue) { this.hourlyValue = hourlyValue; }
    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
