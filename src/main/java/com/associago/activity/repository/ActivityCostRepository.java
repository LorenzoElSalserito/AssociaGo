package com.associago.activity.repository;

import com.associago.activity.ActivityCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityCostRepository extends JpaRepository<ActivityCost, Long> {
    List<ActivityCost> findByActivityId(Long activityId);
}
