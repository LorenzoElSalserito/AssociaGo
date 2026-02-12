package com.associago.finance.fiscal;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_checks")
public class InvoiceCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "check_date")
    private LocalDateTime checkDate = LocalDateTime.now();

    @Column(name = "checked_by")
    private Long checkedBy;

    @Column(name = "total_invoices")
    private Integer totalInvoices = 0;

    @Column(name = "total_amount")
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "total_collected")
    private BigDecimal totalCollected = BigDecimal.ZERO;

    @Column(name = "total_outstanding")
    private BigDecimal totalOutstanding = BigDecimal.ZERO;

    @Column(name = "numbering_ok")
    private boolean numberingOk = true;

    @Column(name = "numbering_issues", columnDefinition = "TEXT")
    private String numberingIssues;

    @Column(name = "payment_ok")
    private boolean paymentOk = true;

    @Column(name = "payment_issues", columnDefinition = "TEXT")
    private String paymentIssues;

    @Column(name = "overdue_count")
    private Integer overdueCount = 0;

    @Column(name = "overdue_amount")
    private BigDecimal overdueAmount = BigDecimal.ZERO;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public LocalDateTime getCheckDate() { return checkDate; }
    public void setCheckDate(LocalDateTime checkDate) { this.checkDate = checkDate; }
    public Long getCheckedBy() { return checkedBy; }
    public void setCheckedBy(Long checkedBy) { this.checkedBy = checkedBy; }
    public Integer getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(Integer totalInvoices) { this.totalInvoices = totalInvoices; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTotalCollected() { return totalCollected; }
    public void setTotalCollected(BigDecimal totalCollected) { this.totalCollected = totalCollected; }
    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
    public boolean isNumberingOk() { return numberingOk; }
    public void setNumberingOk(boolean numberingOk) { this.numberingOk = numberingOk; }
    public String getNumberingIssues() { return numberingIssues; }
    public void setNumberingIssues(String numberingIssues) { this.numberingIssues = numberingIssues; }
    public boolean isPaymentOk() { return paymentOk; }
    public void setPaymentOk(boolean paymentOk) { this.paymentOk = paymentOk; }
    public String getPaymentIssues() { return paymentIssues; }
    public void setPaymentIssues(String paymentIssues) { this.paymentIssues = paymentIssues; }
    public Integer getOverdueCount() { return overdueCount; }
    public void setOverdueCount(Integer overdueCount) { this.overdueCount = overdueCount; }
    public BigDecimal getOverdueAmount() { return overdueAmount; }
    public void setOverdueAmount(BigDecimal overdueAmount) { this.overdueAmount = overdueAmount; }
    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
