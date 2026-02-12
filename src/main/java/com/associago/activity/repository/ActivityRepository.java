package com.associago.activity.repository;

import com.associago.activity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByAssociationId(Long associationId);
    List<Activity> findByAssociationIdAndIsActiveTrue(Long associationId);
}
