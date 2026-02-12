package com.associago.volunteer;

import com.associago.finance.FinancialService;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.volunteer.repository.VolunteerExpenseRepository;
import com.associago.volunteer.repository.VolunteerRepository;
import com.associago.volunteer.repository.VolunteerShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final VolunteerShiftRepository shiftRepository;
    private final VolunteerExpenseRepository expenseRepository;
    private final FinancialService financialService;

    public VolunteerService(VolunteerRepository volunteerRepository, 
                            VolunteerShiftRepository shiftRepository,
                            VolunteerExpenseRepository expenseRepository,
                            FinancialService financialService) {
        this.volunteerRepository = volunteerRepository;
        this.shiftRepository = shiftRepository;
        this.expenseRepository = expenseRepository;
        this.financialService = financialService;
    }

    public Iterable<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    public Optional<Volunteer> getVolunteerById(Long id) {
        return volunteerRepository.findById(id);
    }

    @Transactional
    public Volunteer createVolunteer(Volunteer volunteer) {
        volunteer.setCreatedAt(LocalDateTime.now());
        volunteer.setUpdatedAt(LocalDateTime.now());
        if (volunteer.getStatus() == null) {
            volunteer.setStatus("ACTIVE");
        }
        return volunteerRepository.save(volunteer);
    }

    @Transactional
    public Volunteer updateVolunteer(Long id, Volunteer volunteerDetails) {
        return volunteerRepository.findById(id).map(volunteer -> {
            volunteer.setSkills(volunteerDetails.getSkills());
            volunteer.setAvailability(volunteerDetails.getAvailability());
            volunteer.setStatus(volunteerDetails.getStatus());
            volunteer.setNotes(volunteerDetails.getNotes());
            volunteer.setUpdatedAt(LocalDateTime.now());
            return volunteerRepository.save(volunteer);
        }).orElseThrow(() -> new RuntimeException("Volunteer not found"));
    }

    public void deleteVolunteer(Long id) {
        volunteerRepository.deleteById(id);
    }

    // Shifts
    public List<VolunteerShift> getShiftsByVolunteer(Long volunteerId) {
        return shiftRepository.findByVolunteerId(volunteerId);
    }

    @Transactional
    public VolunteerShift createShift(VolunteerShift shift) {
        if (shift.getStatus() == null) {
            shift.setStatus("SCHEDULED");
        }
        return shiftRepository.save(shift);
    }

    @Transactional
    public VolunteerShift updateShift(Long id, VolunteerShift shiftDetails) {
        return shiftRepository.findById(id).map(shift -> {
            shift.setStartTime(shiftDetails.getStartTime());
            shift.setEndTime(shiftDetails.getEndTime());
            shift.setRole(shiftDetails.getRole());
            shift.setHoursWorked(shiftDetails.getHoursWorked());
            shift.setStatus(shiftDetails.getStatus());
            return shiftRepository.save(shift);
        }).orElseThrow(() -> new RuntimeException("Shift not found"));
    }

    // Expenses
    public List<VolunteerExpense> getExpensesByVolunteer(Long volunteerId) {
        return expenseRepository.findByVolunteerId(volunteerId);
    }

    @Transactional
    public VolunteerExpense createExpense(VolunteerExpense expense) {
        expense.setCreatedAt(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());
        if (expense.getStatus() == null) {
            expense.setStatus("PENDING");
        }
        return expenseRepository.save(expense);
    }

    @Transactional
    public VolunteerExpense updateExpenseStatus(Long id, String status) {
        return expenseRepository.findById(id).map(expense -> {
            expense.setStatus(status);
            expense.setUpdatedAt(LocalDateTime.now());
            
            // If approved and paid, create financial transaction
            if ("PAID".equals(status) && expense.getTransactionId() == null) {
                Transaction transaction = new Transaction();
                // Assuming we can get associationId from somewhere, or it's global context. 
                // For now, we might need to fetch it from volunteer->member or pass it.
                // Simplified: Assuming associationId 1 for MVP or fetched from context if available.
                // Ideally, Volunteer entity should have associationId or linked Member has it.
                // Let's assume we handle this association link properly in a real scenario.
                transaction.setAssociationId(1L); // Placeholder
                transaction.setDate(java.time.LocalDate.now());
                transaction.setAmount(expense.getAmount());
                transaction.setType(TransactionType.EXPENSE);
                transaction.setDescription("Volunteer Reimbursement: " + expense.getDescription());
                transaction.setCategory("Reimbursement");
                
                Transaction savedTx = financialService.saveTransaction(transaction);
                expense.setTransactionId(savedTx.getId());
            }
            
            return expenseRepository.save(expense);
        }).orElseThrow(() -> new RuntimeException("Expense not found"));
    }
}
