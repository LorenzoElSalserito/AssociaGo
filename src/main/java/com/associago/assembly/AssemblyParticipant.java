package com.associago.assembly;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assembly_participants")
public class AssemblyParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "assembly_id", nullable = false)
    private Long assemblyId;
    
    @Column(name = "user_association_id", nullable = false)
    private Long userAssociationId;
    
    @Column(name = "participation_type")
    private String participationType; // 'PRESENT', 'PROXY', 'ABSENT'
    
    @Column(name = "proxy_receiver_id")
    private Long proxyReceiverId; // Who received the proxy
    
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    private String role; // 'MEMBER', 'PRESIDENT', 'SECRETARY', 'SCRUTINEER'

    private String notes;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssemblyId() { return assemblyId; }
    public void setAssemblyId(Long assemblyId) { this.assemblyId = assemblyId; }
    public Long getUserAssociationId() { return userAssociationId; }
    public void setUserAssociationId(Long userAssociationId) { this.userAssociationId = userAssociationId; }
    public String getParticipationType() { return participationType; }
    public void setParticipationType(String participationType) { this.participationType = participationType; }
    public Long getProxyReceiverId() { return proxyReceiverId; }
    public void setProxyReceiverId(Long proxyReceiverId) { this.proxyReceiverId = proxyReceiverId; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }
    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime checkOutTime) { this.checkOutTime = checkOutTime; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
