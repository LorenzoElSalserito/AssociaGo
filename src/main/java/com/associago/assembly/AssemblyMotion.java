package com.associago.assembly;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assembly_motions")
public class AssemblyMotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assembly_id", nullable = false)
    private Long assemblyId;

    @Column(name = "order_number")
    private Integer orderNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "voting_type")
    private String votingType; // 'SIMPLE', 'QUALIFIED', 'UNANIMITY', 'CONSULTATIVE'

    @Column(name = "is_planned")
    private boolean isPlanned = true;

    @Column(name = "decision_taken")
    private String decisionTaken;

    @Column(name = "decision_summary", columnDefinition = "TEXT")
    private String decisionSummary;

    @Column(name = "votes_in_favor")
    private Integer votesInFavor = 0;

    @Column(name = "votes_against")
    private Integer votesAgainst = 0;

    @Column(name = "votes_abstain")
    private Integer votesAbstain = 0;

    @Column(name = "valid_votes")
    private Integer validVotes = 0;

    @Column(name = "is_approved")
    private boolean isApproved = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssemblyId() { return assemblyId; }
    public void setAssemblyId(Long assemblyId) { this.assemblyId = assemblyId; }
    public Integer getOrderNumber() { return orderNumber; }
    public void setOrderNumber(Integer orderNumber) { this.orderNumber = orderNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVotingType() { return votingType; }
    public void setVotingType(String votingType) { this.votingType = votingType; }
    public boolean isPlanned() { return isPlanned; }
    public void setPlanned(boolean planned) { isPlanned = planned; }
    public String getDecisionTaken() { return decisionTaken; }
    public void setDecisionTaken(String decisionTaken) { this.decisionTaken = decisionTaken; }
    public String getDecisionSummary() { return decisionSummary; }
    public void setDecisionSummary(String decisionSummary) { this.decisionSummary = decisionSummary; }
    public Integer getVotesInFavor() { return votesInFavor; }
    public void setVotesInFavor(Integer votesInFavor) { this.votesInFavor = votesInFavor; }
    public Integer getVotesAgainst() { return votesAgainst; }
    public void setVotesAgainst(Integer votesAgainst) { this.votesAgainst = votesAgainst; }
    public Integer getVotesAbstain() { return votesAbstain; }
    public void setVotesAbstain(Integer votesAbstain) { this.votesAbstain = votesAbstain; }
    public Integer getValidVotes() { return validVotes; }
    public void setValidVotes(Integer validVotes) { this.validVotes = validVotes; }
    public boolean isApproved() { return isApproved; }
    public void setApproved(boolean approved) { isApproved = approved; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
