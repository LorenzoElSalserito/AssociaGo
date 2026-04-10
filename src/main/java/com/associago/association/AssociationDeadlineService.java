package com.associago.association;

import com.associago.association.repository.AssociationDeadlineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssociationDeadlineService {

    private final AssociationDeadlineRepository deadlineRepository;

    public AssociationDeadlineService(AssociationDeadlineRepository deadlineRepository) {
        this.deadlineRepository = deadlineRepository;
    }

    public List<AssociationDeadline> findByAssociationId(Long associationId) {
        return deadlineRepository.findByAssociationId(associationId);
    }

    public List<AssociationDeadline> findPending(Long associationId) {
        return deadlineRepository.findByAssociationIdAndStatus(associationId, "pending");
    }

    public AssociationDeadline findById(Long id) {
        return deadlineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Deadline not found: " + id));
    }

    @Transactional
    public AssociationDeadline create(AssociationDeadline deadline) {
        return deadlineRepository.save(deadline);
    }

    @Transactional
    public AssociationDeadline update(Long id, AssociationDeadline updated) {
        AssociationDeadline existing = findById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setDueDate(updated.getDueDate());
        existing.setCategory(updated.getCategory());
        existing.setReminderDays(updated.getReminderDays());
        existing.setRecurring(updated.isRecurring());
        existing.setRecurringMonths(updated.getRecurringMonths());
        return deadlineRepository.save(existing);
    }

    @Transactional
    public AssociationDeadline complete(Long id, Long completedBy) {
        AssociationDeadline deadline = findById(id);
        deadline.setStatus("completed");
        deadline.setCompletedAt(LocalDateTime.now());
        deadline.setCompletedBy(completedBy);
        return deadlineRepository.save(deadline);
    }

    @Transactional
    public void delete(Long id) {
        deadlineRepository.deleteById(id);
    }
}
