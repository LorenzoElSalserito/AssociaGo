package com.associago.attendance.repository;

import com.associago.attendance.AttendanceSession;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends CrudRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByActivityId(Long activityId);
}
