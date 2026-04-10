package com.associago.balance;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "annual_balances", uniqueConstraints = @UniqueConstraint(columnNames = {"association_id", "year"}))
public class AnnualBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String title;

    private String status = "DRAFT";

    @Column(name = "total_income")
    private BigDecimal totalIncome = BigDecimal.ZERO;

    @Column(name = "total_expenses")
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    @Column(name = "net_result")
    private BigDecimal netResult = BigDecimal.ZERO;

    @Column(name = "opening_fund")
    private BigDecimal openingFund = BigDecimal.ZERO;

    @Column(name = "closing_fund")
    private BigDecimal closingFund = BigDecimal.ZERO;

    @Column(name = "computed_at")
    private LocalDateTime computedAt;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(columnDefinition = "TEXT")
    private String signatories; // JSON

    @Column(name = "pdf_path")
    private String pdfPath;

    private String checksum;
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getNetResult() { return netResult; }
    public void setNetResult(BigDecimal netResult) { this.netResult = netResult; }
    public BigDecimal getOpeningFund() { return openingFund; }
    public void setOpeningFund(BigDecimal openingFund) { this.openingFund = openingFund; }
    public BigDecimal getClosingFund() { return closingFund; }
    public void setClosingFund(BigDecimal closingFund) { this.closingFund = closingFund; }
    public LocalDateTime getComputedAt() { return computedAt; }
    public void setComputedAt(LocalDateTime computedAt) { this.computedAt = computedAt; }
    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getSignatories() { return signatories; }
    public void setSignatories(String signatories) { this.signatories = signatories; }
    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
