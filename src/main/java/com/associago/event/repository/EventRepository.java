package com.associago.event.repository;

import com.associago.event.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    java.util.List<Event> findByAssociationId(Long associationId);
    long countByStartDatetimeAfter(LocalDateTime now);
    Event findFirstByStartDatetimeAfterOrderByStartDatetimeAsc(LocalDateTime now);
}
