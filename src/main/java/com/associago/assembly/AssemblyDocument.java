package com.associago.assembly;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assembly_documents")
public class AssemblyDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assembly_id", nullable = false)
    private Long assemblyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // 'MINUTES', 'CALL', 'ATTACHMENT', 'BUDGET'

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    private String description;

    @Column(name = "is_mandatory")
    private boolean isMandatory = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssemblyId() { return assemblyId; }
    public void setAssemblyId(Long assemblyId) { this.assemblyId = assemblyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isMandatory() { return isMandatory; }
    public void setMandatory(boolean mandatory) { isMandatory = mandatory; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
