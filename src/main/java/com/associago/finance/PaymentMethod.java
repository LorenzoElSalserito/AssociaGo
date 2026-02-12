package com.associago.finance;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private String name; // e.g., "PayPal", "Bonifico", "Contanti"

    @Column(nullable = false)
    private String type; // 'CASH', 'BANK_TRANSFER', 'ONLINE', 'OTHER'

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "has_commission")
    private boolean hasCommission = false;

    @Column(name = "fixed_commission")
    private BigDecimal fixedCommission = BigDecimal.ZERO;

    @Column(name = "percentage_commission")
    private BigDecimal percentageCommission = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String configuration; // JSON for specific config (e.g., API keys)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public boolean isHasCommission() { return hasCommission; }
    public void setHasCommission(boolean hasCommission) { this.hasCommission = hasCommission; }
    public BigDecimal getFixedCommission() { return fixedCommission; }
    public void setFixedCommission(BigDecimal fixedCommission) { this.fixedCommission = fixedCommission; }
    public BigDecimal getPercentageCommission() { return percentageCommission; }
    public void setPercentageCommission(BigDecimal percentageCommission) { this.percentageCommission = percentageCommission; }
    public String getConfiguration() { return configuration; }
    public void setConfiguration(String configuration) { this.configuration = configuration; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
