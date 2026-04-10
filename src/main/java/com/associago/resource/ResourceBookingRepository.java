package com.associago.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ResourceBookingRepository extends JpaRepository<ResourceBooking, Long> {
    List<ResourceBooking> findByAssociationId(Long associationId);
    List<ResourceBooking> findByResourceId(Long resourceId);

    @Query("SELECT b FROM ResourceBooking b WHERE b.resourceId = :resourceId " +
           "AND b.status != 'CANCELLED' " +
           "AND b.startDatetime < :end AND b.endDatetime > :start")
    List<ResourceBooking> findConflicts(@Param("resourceId") Long resourceId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);

    @Query("SELECT b FROM ResourceBooking b WHERE b.associationId = :associationId " +
           "AND b.startDatetime >= :start AND b.startDatetime <= :end " +
           "AND b.status != 'CANCELLED'")
    List<ResourceBooking> findByAssociationAndDateRange(@Param("associationId") Long associationId,
                                                         @Param("start") LocalDateTime start,
                                                         @Param("end") LocalDateTime end);
}
