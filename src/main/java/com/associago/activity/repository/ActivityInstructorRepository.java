package com.associago.activity.repository;

import com.associago.activity.ActivityInstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityInstructorRepository extends JpaRepository<ActivityInstructor, Long> {
    List<ActivityInstructor> findByActivityId(Long activityId);
}
