package com.associago.notification;

import com.associago.notification.repository.NotificationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    public static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 200;
    private static final ObjectMapper JSON = new ObjectMapper();

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadUserNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    public List<Notification> getAssociationNotifications(Long associationId, Integer limit) {
        int size = limit == null || limit < 1 ? DEFAULT_LIMIT : Math.min(limit, MAX_LIMIT);
        return notificationRepository.findByAssociationIdOrderByIdDesc(associationId, PageRequest.of(0, size));
    }

    public long countUnread(Long associationId) {
        return notificationRepository.countByAssociationIdAndIsReadFalse(associationId);
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message, String type, String entityType, Long entityId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedEntityType(entityType);
        notification.setRelatedEntityId(entityId);
        return notificationRepository.save(notification);
    }

    /**
     * Creates a notification for the association's bell. The text is rendered by the client from
     * {@code messageKey} (".title" / ".message") interpolated with {@code params}.
     */
    @Transactional
    public Notification notifyAssociation(Long associationId, Long userId, String messageKey, Map<String, ?> params,
                                          String type, String entityType, Long entityId) {
        Notification notification = new Notification();
        notification.setAssociationId(associationId);
        notification.setUserId(userId);
        notification.setMessageKey(messageKey);
        notification.setMessageParams(toJson(params));
        notification.setTitle(messageKey);
        notification.setMessage("");
        notification.setType(type);
        notification.setRelatedEntityType(entityType);
        notification.setRelatedEntityId(entityId);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public boolean markAsRead(Long notificationId, Long associationId) {
        return notificationRepository.findByIdAndAssociationId(notificationId, associationId).map(n -> {
            n.setRead(true);
            notificationRepository.save(n);
            return true;
        }).orElse(false);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public int markAllAsReadForAssociation(Long associationId) {
        return notificationRepository.markAllReadByAssociationId(associationId);
    }

    private static String toJson(Map<String, ?> params) {
        if (params == null || params.isEmpty()) return null;
        try {
            return JSON.writeValueAsString(params);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid notification params", e);
        }
    }
}
