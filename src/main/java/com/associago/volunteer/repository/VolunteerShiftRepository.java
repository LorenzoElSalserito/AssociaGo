package com.associago.volunteer.repository;

import com.associago.volunteer.VolunteerShift;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VolunteerShiftRepository extends CrudRepository<VolunteerShift, Long> {
    List<VolunteerShift> findByVolunteerId(Long volunteerId);
    List<VolunteerShift> findByEventId(Long eventId);
    List<VolunteerShift> findByActivityId(Long activityId);
}
