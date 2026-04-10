package com.associago.certificate;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificate_templates")
public class CertificateTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // PARTICIPATION, ATTENDANCE, TRAINING, MEMBERSHIP, CUSTOM

    @Column(name = "body_html", nullable = false, columnDefinition = "TEXT")
    private String bodyHtml;

    @Column(name = "merge_fields", columnDefinition = "TEXT")
    private String mergeFields; // JSON

    @Column(name = "header_image_path")
    private String headerImagePath;

    @Column(name = "footer_image_path")
    private String footerImagePath;

    @Column(name = "background_image_path")
    private String backgroundImagePath;

    @Column(name = "signatory_roles", columnDefinition = "TEXT")
    private String signatoryRoles; // JSON array: ["PRESIDENT", "SECRETARY"]

    private String orientation = "LANDSCAPE";

    @Column(name = "paper_size")
    private String paperSize = "A4";

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getBodyHtml() { return bodyHtml; }
    public void setBodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; }
    public String getMergeFields() { return mergeFields; }
    public void setMergeFields(String mergeFields) { this.mergeFields = mergeFields; }
    public String getHeaderImagePath() { return headerImagePath; }
    public void setHeaderImagePath(String headerImagePath) { this.headerImagePath = headerImagePath; }
    public String getFooterImagePath() { return footerImagePath; }
    public void setFooterImagePath(String footerImagePath) { this.footerImagePath = footerImagePath; }
    public String getBackgroundImagePath() { return backgroundImagePath; }
    public void setBackgroundImagePath(String backgroundImagePath) { this.backgroundImagePath = backgroundImagePath; }
    public String getSignatoryRoles() { return signatoryRoles; }
    public void setSignatoryRoles(String signatoryRoles) { this.signatoryRoles = signatoryRoles; }
    public String getOrientation() { return orientation; }
    public void setOrientation(String orientation) { this.orientation = orientation; }
    public String getPaperSize() { return paperSize; }
    public void setPaperSize(String paperSize) { this.paperSize = paperSize; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
