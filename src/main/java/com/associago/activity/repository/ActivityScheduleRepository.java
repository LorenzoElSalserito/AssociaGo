package com.associago.activity.repository;

import com.associago.activity.ActivitySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityScheduleRepository extends JpaRepository<ActivitySchedule, Long> {
    List<ActivitySchedule> findByActivityId(Long activityId);
}
