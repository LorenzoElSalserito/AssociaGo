package com.associago.activity.repository;

import com.associago.activity.ActivityParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, Long> {
    List<ActivityParticipant> findByActivityId(Long activityId);
    Integer countByActivityId(Long activityId);
    List<ActivityParticipant> findByUser_Id(Long userId);
    Optional<ActivityParticipant> findByActivityIdAndUser_Id(Long activityId, Long userId);
}
