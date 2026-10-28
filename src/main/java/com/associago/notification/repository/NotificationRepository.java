package com.associago.notification.repository;

import com.associago.notification.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndIsReadFalse(Long userId);

    List<Notification> findByAssociationIdOrderByIdDesc(Long associationId, Pageable pageable);
    long countByAssociationIdAndIsReadFalse(Long associationId);
    Optional<Notification> findByIdAndAssociationId(Long id, Long associationId);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.associationId = :associationId and n.isRead = false")
    int markAllReadByAssociationId(@Param("associationId") Long associationId);
}
