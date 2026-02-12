package com.associago.finance.fiscal;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fiscal_comparisons")
public class FiscalComparison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @Column(name = "base_year", nullable = false)
    private Integer baseYear;

    @Column(name = "comparison_year", nullable = false)
    private Integer comparisonYear;

    @Column(name = "generated_by")
    private Long generatedBy;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "csv_path")
    private String csvPath;

    private String checksum;

    @Column(name = "data_snapshot", columnDefinition = "TEXT")
    private String dataSnapshot;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public Integer getBaseYear() { return baseYear; }
    public void setBaseYear(Integer baseYear) { this.baseYear = baseYear; }
    public Integer getComparisonYear() { return comparisonYear; }
    public void setComparisonYear(Integer comparisonYear) { this.comparisonYear = comparisonYear; }
    public Long getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(Long generatedBy) { this.generatedBy = generatedBy; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    public String getCsvPath() { return csvPath; }
    public void setCsvPath(String csvPath) { this.csvPath = csvPath; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public String getDataSnapshot() { return dataSnapshot; }
    public void setDataSnapshot(String dataSnapshot) { this.dataSnapshot = dataSnapshot; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
