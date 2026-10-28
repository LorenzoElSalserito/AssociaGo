package com.associago.notification;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "association_id")
    private Long associationId;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String message;

    // i18n key rendered by the client; legacy rows only carry literal title/message.
    @Column(name = "message_key")
    private String messageKey;

    @Column(name = "message_params", columnDefinition = "TEXT")
    private String messageParams;

    @Column(nullable = false)
    private String type; // INFO, WARNING, ALERT, REMINDER

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(name = "related_entity_type")
    private String relatedEntityType; // EVENT, ACTIVITY, MEMBERSHIP

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssociationId() { return associationId; }
    public void setAssociationId(Long associationId) { this.associationId = associationId; }
    public String getMessageKey() { return messageKey; }
    public void setMessageKey(String messageKey) { this.messageKey = messageKey; }
    public String getMessageParams() { return messageParams; }
    public void setMessageParams(String messageParams) { this.messageParams = messageParams; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }
    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
