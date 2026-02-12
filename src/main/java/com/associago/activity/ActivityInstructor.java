package com.associago.activity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_instructors")
public class ActivityInstructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_id", nullable = false)
    private Long activityId;

    @Column(name = "user_association_id")
    private Long userAssociationId; // If the instructor is a member

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String specialization;
    private String certifications;

    private BigDecimal compensation;
    
    @Column(name = "compensation_type")
    private String compensationType; // 'FIXED', 'HOURLY', 'PERCENTAGE'

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }
    public Long getUserAssociationId() { return userAssociationId; }
    public void setUserAssociationId(Long userAssociationId) { this.userAssociationId = userAssociationId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
    public BigDecimal getCompensation() { return compensation; }
    public void setCompensation(BigDecimal compensation) { this.compensation = compensation; }
    public String getCompensationType() { return compensationType; }
    public void setCompensationType(String compensationType) { this.compensationType = compensationType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
