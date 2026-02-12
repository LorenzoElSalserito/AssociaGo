package com.associago.volunteer.repository;

import com.associago.volunteer.VolunteerExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerExpenseRepository extends JpaRepository<VolunteerExpense, Long> {
    List<VolunteerExpense> findByVolunteerId(Long volunteerId);
    List<VolunteerExpense> findByStatus(String status);
}
