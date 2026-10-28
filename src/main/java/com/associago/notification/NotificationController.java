package com.associago.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAssociationNotifications(@RequestHeader("X-Association-Id") Long associationId,
                                                                          @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(notificationService.getAssociationNotifications(associationId, limit));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("X-Association-Id") Long associationId) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(associationId)));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsReadForAssociation(@RequestHeader("X-Association-Id") Long associationId) {
        return ResponseEntity.ok(Map.of("updated", notificationService.markAllAsReadForAssociation(associationId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadUserNotifications(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id,
                                           @RequestHeader(value = "X-Association-Id", required = false) Long associationId) {
        if (associationId == null) {
            notificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        }
        return notificationService.markAsRead(id, associationId)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
