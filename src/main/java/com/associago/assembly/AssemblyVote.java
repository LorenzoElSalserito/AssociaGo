package com.associago.assembly;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assembly_votes")
public class AssemblyVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assembly_id", nullable = false)
    private Long assemblyId;

    @Column(name = "motion_id", nullable = false)
    private Long motionId;

    @Column(name = "user_association_id", nullable = false)
    private Long userAssociationId;

    @Column(nullable = false)
    private String vote; // 'FAVORABLE', 'AGAINST', 'ABSTAIN', 'NON_VOTING'

    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssemblyId() { return assemblyId; }
    public void setAssemblyId(Long assemblyId) { this.assemblyId = assemblyId; }
    public Long getMotionId() { return motionId; }
    public void setMotionId(Long motionId) { this.motionId = motionId; }
    public Long getUserAssociationId() { return userAssociationId; }
    public void setUserAssociationId(Long userAssociationId) { this.userAssociationId = userAssociationId; }
    public String getVote() { return vote; }
    public void setVote(String vote) { this.vote = vote; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
