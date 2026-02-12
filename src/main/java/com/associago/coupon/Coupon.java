package com.associago.coupon;

import com.associago.activity.Activity;
import com.associago.event.Event;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private String code;

    private String description;

    @Column(name = "discount_type", nullable = false)
    private String discountType; // 'PERCENTAGE', 'FIXED_AMOUNT'

    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "current_uses")
    private Integer currentUses = 0;

    @Column(name = "is_active")
    private boolean isActive = true;

    // --- Campi Aggiunti ---
    @Column(name = "min_amount")
    private BigDecimal minAmount = BigDecimal.ZERO;

    @ManyToMany
    @JoinTable(
        name = "coupon_activities",
        joinColumns = @JoinColumn(name = "coupon_id"),
        inverseJoinColumns = @JoinColumn(name = "activity_id")
    )
    private Set<Activity> applicableActivities = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "coupon_events",
        joinColumns = @JoinColumn(name = "coupon_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    private Set<Event> applicableEvents = new HashSet<>();
    // --- Fine Campi Aggiunti ---

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }
    public Integer getCurrentUses() { return currentUses; }
    public void setCurrentUses(Integer currentUses) { this.currentUses = currentUses; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public BigDecimal getMinAmount() { return minAmount; }
    public void setMinAmount(BigDecimal minAmount) { this.minAmount = minAmount; }
    public Set<Activity> getApplicableActivities() { return applicableActivities; }
    public void setApplicableActivities(Set<Activity> applicableActivities) { this.applicableActivities = applicableActivities; }
    public Set<Event> getApplicableEvents() { return applicableEvents; }
    public void setApplicableEvents(Set<Event> applicableEvents) { this.applicableEvents = applicableEvents; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
