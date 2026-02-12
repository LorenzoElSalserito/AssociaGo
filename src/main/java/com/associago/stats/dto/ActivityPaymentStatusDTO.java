package com.associago.stats.dto;

public class ActivityPaymentStatusDTO {
    private Integer totalPayments;
    private Integer confirmedPayments;
    private Integer pendingPayments;
    private Integer overduePayments;
    private Double paidPercentage;

    // Getters and Setters
    public Integer getTotalPayments() { return totalPayments; }
    public void setTotalPayments(Integer totalPayments) { this.totalPayments = totalPayments; }
    public Integer getConfirmedPayments() { return confirmedPayments; }
    public void setConfirmedPayments(Integer confirmedPayments) { this.confirmedPayments = confirmedPayments; }
    public Integer getPendingPayments() { return pendingPayments; }
    public void setPendingPayments(Integer pendingPayments) { this.pendingPayments = pendingPayments; }
    public Integer getOverduePayments() { return overduePayments; }
    public void setOverduePayments(Integer overduePayments) { this.overduePayments = overduePayments; }
    public Double getPaidPercentage() { return paidPercentage; }
    public void setPaidPercentage(Double paidPercentage) { this.paidPercentage = paidPercentage; }
}
