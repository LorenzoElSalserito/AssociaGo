package com.associago.volunteer.repository;

import com.associago.volunteer.Volunteer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VolunteerRepository extends CrudRepository<Volunteer, Long> {
}
