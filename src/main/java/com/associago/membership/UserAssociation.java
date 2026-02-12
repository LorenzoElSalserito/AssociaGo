package com.associago.membership;

import com.associago.association.Association;
import com.associago.user.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_associations")
public class UserAssociation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "association_id", nullable = false)
    private Association association;

    @Column(name = "membership_card_number")
    private String membershipCardNumber;

    @Column(nullable = false)
    private String role = "MEMBER"; // 'PRESIDENT', 'SECRETARY', 'TREASURER', 'ADMIN', 'MEMBER'

    @Column(nullable = false)
    private String status = "ACTIVE"; // 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'RESIGNED'

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "last_renewal_date")
    private LocalDate lastRenewalDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_board_member")
    private boolean isBoardMember = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Association getAssociation() { return association; }
    public void setAssociation(Association association) { this.association = association; }
    public String getMembershipCardNumber() { return membershipCardNumber; }
    public void setMembershipCardNumber(String membershipCardNumber) { this.membershipCardNumber = membershipCardNumber; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    public LocalDate getLastRenewalDate() { return lastRenewalDate; }
    public void setLastRenewalDate(LocalDate lastRenewalDate) { this.lastRenewalDate = lastRenewalDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isBoardMember() { return isBoardMember; }
    public void setBoardMember(boolean boardMember) { isBoardMember = boardMember; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
