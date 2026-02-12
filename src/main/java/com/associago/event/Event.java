package com.associago.event;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "association_id")
    private Long associationId;
    
    private String name;
    private String description;
    private String type;
    
    @Column(name = "start_datetime")
    private LocalDateTime startDatetime;
    
    @Column(name = "end_datetime")
    private LocalDateTime endDatetime;
    
    private String location;
    private String address;
    
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @Column(name = "cost_member")
    private BigDecimal costMember;
    
    @Column(name = "cost_non_member")
    private BigDecimal costNonMember;
    
    @Column(name = "is_public")
    private Boolean isPublic;
    
    private String status;

    @Column(name = "require_registration")
    private boolean requireRegistration = true;

    @Column(name = "generate_invoice")
    private boolean generateInvoice = false;

    @Column(name = "cancellation_date")
    private LocalDateTime cancellationDate;

    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }
    public LocalDateTime getEndDatetime() { return endDatetime; }
    public void setEndDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public BigDecimal getCostMember() { return costMember; }
    public void setCostMember(BigDecimal costMember) { this.costMember = costMember; }
    public BigDecimal getCostNonMember() { return costNonMember; }
    public void setCostNonMember(BigDecimal costNonMember) { this.costNonMember = costNonMember; }
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isRequireRegistration() { return requireRegistration; }
    public void setRequireRegistration(boolean requireRegistration) { this.requireRegistration = requireRegistration; }
    public boolean isGenerateInvoice() { return generateInvoice; }
    public void setGenerateInvoice(boolean generateInvoice) { this.generateInvoice = generateInvoice; }
    public LocalDateTime getCancellationDate() { return cancellationDate; }
    public void setCancellationDate(LocalDateTime cancellationDate) { this.cancellationDate = cancellationDate; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
