package com.associago.assembly;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assemblies")
public class Assembly {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;
    
    private String title;
    private String description;
    private LocalDateTime date;
    
    @Column(name = "start_time")
    private String startTime; // HH:mm
    
    @Column(name = "end_time")
    private String endTime; // HH:mm
    
    private String location;
    private String type; // ORDINARY, EXTRAORDINARY
    private String status; // DRAFT, CALLED, IN_PROGRESS, CLOSED, CANCELLED
    
    private String president;
    private String secretary;

    @Column(name = "first_call_quorum")
    private Double firstCallQuorum;
    
    @Column(name = "second_call_quorum")
    private Double secondCallQuorum;
    
    @Column(name = "is_quorum_reached")
    private boolean isQuorumReached = false;

    @Column(name = "minutes_path")
    private String minutesPath;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPresident() { return president; }
    public void setPresident(String president) { this.president = president; }
    public String getSecretary() { return secretary; }
    public void setSecretary(String secretary) { this.secretary = secretary; }
    public Double getFirstCallQuorum() { return firstCallQuorum; }
    public void setFirstCallQuorum(Double firstCallQuorum) { this.firstCallQuorum = firstCallQuorum; }
    public Double getSecondCallQuorum() { return secondCallQuorum; }
    public void setSecondCallQuorum(Double secondCallQuorum) { this.secondCallQuorum = secondCallQuorum; }
    public boolean isQuorumReached() { return isQuorumReached; }
    public void setQuorumReached(boolean quorumReached) { isQuorumReached = quorumReached; }
    public String getMinutesPath() { return minutesPath; }
    public void setMinutesPath(String minutesPath) { this.minutesPath = minutesPath; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
