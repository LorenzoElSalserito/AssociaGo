package com.associago.signature;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "institutional_signatures",
       uniqueConstraints = @UniqueConstraint(columnNames = {"association_id", "signer_role"}))
public class InstitutionalSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id", nullable = false)
    private Long associationId;

    @Column(name = "signer_role", nullable = false)
    private String signerRole; // PRESIDENT, SECRETARY, TREASURER, CUSTOM

    @Column(name = "signer_name", nullable = false)
    private String signerName;

    @Column(name = "signer_title")
    private String signerTitle;

    @Column(name = "signature_image")
    @JdbcTypeCode(SqlTypes.VARBINARY)
    private byte[] signatureImage;

    @Column(name = "signature_mime_type")
    private String signatureMimeType;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }

    public String getSignerRole() { return signerRole; }
    public void setSignerRole(String signerRole) { this.signerRole = signerRole; }

    public String getSignerName() { return signerName; }
    public void setSignerName(String signerName) { this.signerName = signerName; }

    public String getSignerTitle() { return signerTitle; }
    public void setSignerTitle(String signerTitle) { this.signerTitle = signerTitle; }

    public byte[] getSignatureImage() { return signatureImage; }
    public void setSignatureImage(byte[] signatureImage) { this.signatureImage = signatureImage; }

    public String getSignatureMimeType() { return signatureMimeType; }
    public void setSignatureMimeType(String signatureMimeType) { this.signatureMimeType = signatureMimeType; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
