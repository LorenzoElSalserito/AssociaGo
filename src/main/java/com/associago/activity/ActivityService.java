package com.associago.activity;

import com.associago.activity.repository.*;
import com.associago.stats.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityParticipantRepository participantRepository;
    private final ActivityCostRepository costRepository;
    private final ActivityInstructorRepository instructorRepository;
    private final ActivityScheduleRepository scheduleRepository;

    @Autowired
    public ActivityService(ActivityRepository activityRepository,
                           ActivityParticipantRepository participantRepository,
                           ActivityCostRepository costRepository,
                           ActivityInstructorRepository instructorRepository,
                           ActivityScheduleRepository scheduleRepository) {
        this.activityRepository = activityRepository;
        this.participantRepository = participantRepository;
        this.costRepository = costRepository;
        this.instructorRepository = instructorRepository;
        this.scheduleRepository = scheduleRepository;
    }

    // --- Basic CRUD Methods ---

    public List<Activity> findByAssociationId(Long associationId) {
        return activityRepository.findByAssociationId(associationId);
    }

    public Optional<Activity> findById(Long id) {
        return activityRepository.findById(id);
    }

    @Transactional
    public Activity save(Activity activity) {
        return activityRepository.save(activity);
    }

    @Transactional
    public void deleteById(Long id) {
        activityRepository.deleteById(id);
    }

    // --- Participant Methods ---

    public List<ActivityParticipant> findParticipantsByActivityId(Long activityId) {
        return participantRepository.findByActivityId(activityId);
    }

    @Transactional
    public ActivityParticipant registerParticipant(ActivityParticipant participant) {
        return participantRepository.save(participant);
    }

    @Transactional
    public void removeParticipant(Long participantId) {
        participantRepository.deleteById(participantId);
    }

    // --- Cost Methods ---

    public List<ActivityCost> findCostsByActivityId(Long activityId) {
        return costRepository.findByActivityId(activityId);
    }

    @Transactional
    public ActivityCost addCost(ActivityCost cost) {
        return costRepository.save(cost);
    }

    @Transactional
    public ActivityCost updateCost(Long costId, ActivityCost details) {
        return costRepository.findById(costId).map(cost -> {
            cost.setDescription(details.getDescription());
            cost.setAmount(details.getAmount());
            cost.setCategory(details.getCategory());
            cost.setDate(details.getDate());
            cost.setRecurring(details.isRecurring());
            cost.setFrequency(details.getFrequency());
            cost.setSupplier(details.getSupplier());
            cost.setNotes(details.getNotes());
            return costRepository.save(cost);
        }).orElseThrow(() -> new RuntimeException("Cost not found"));
    }

    @Transactional
    public void deleteCost(Long costId) {
        costRepository.deleteById(costId);
    }

    // --- Instructor Methods ---

    public List<ActivityInstructor> findInstructorsByActivityId(Long activityId) {
        return instructorRepository.findByActivityId(activityId);
    }

    @Transactional
    public ActivityInstructor addInstructor(ActivityInstructor instructor) {
        return instructorRepository.save(instructor);
    }

    @Transactional
    public ActivityInstructor updateInstructor(Long instructorId, ActivityInstructor details) {
        return instructorRepository.findById(instructorId).map(instructor -> {
            instructor.setFirstName(details.getFirstName());
            instructor.setLastName(details.getLastName());
            instructor.setEmail(details.getEmail());
            instructor.setPhone(details.getPhone());
            instructor.setSpecialization(details.getSpecialization());
            instructor.setCompensation(details.getCompensation());
            instructor.setCompensationType(details.getCompensationType());
            instructor.setActive(details.isActive());
            return instructorRepository.save(instructor);
        }).orElseThrow(() -> new RuntimeException("Instructor not found"));
    }

    @Transactional
    public void deleteInstructor(Long instructorId) {
        instructorRepository.deleteById(instructorId);
    }

    // --- Schedule Methods ---

    public List<ActivitySchedule> findSchedulesByActivityId(Long activityId) {
        return scheduleRepository.findByActivityId(activityId);
    }

    @Transactional
    public ActivitySchedule addSchedule(ActivitySchedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public ActivitySchedule updateSchedule(Long scheduleId, ActivitySchedule details) {
        return scheduleRepository.findById(scheduleId).map(schedule -> {
            schedule.setDayOfWeek(details.getDayOfWeek());
            schedule.setStartTime(details.getStartTime());
            schedule.setEndTime(details.getEndTime());
            schedule.setLocation(details.getLocation());
            schedule.setInstructorId(details.getInstructorId());
            schedule.setActive(details.isActive());
            return scheduleRepository.save(schedule);
        }).orElseThrow(() -> new RuntimeException("Schedule not found"));
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }

    // --- Advanced Reporting & Stats Methods ---

    public ActivityWithDetailsDTO getActivityWithDetails(Long activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        List<ActivityParticipant> participants = participantRepository.findByActivityId(activityId);
        List<ActivityCost> costs = costRepository.findByActivityId(activityId);
        List<ActivityInstructor> instructors = instructorRepository.findByActivityId(activityId);

        ActivityWithDetailsDTO dto = new ActivityWithDetailsDTO();
        dto.setActivity(activity);
        dto.setInstructors(instructors);
        
        // Participants Stats
        dto.setTotalParticipants(participants.size());
        dto.setActiveParticipants((int) participants.stream().filter(ActivityParticipant::isActive).count());
        dto.setPendingParticipants((int) participants.stream().filter(p -> !p.isPaid() && p.isActive()).count());
        dto.setWaitingListCount(0); 

        // Financial Stats
        BigDecimal paidRevenue = participants.stream()
                .filter(ActivityParticipant::isPaid)
                .map(ActivityParticipant::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingRevenue = participants.stream()
                .filter(p -> !p.isPaid())
                .map(p -> {
                    BigDecimal cost = activity.getCost() != null ? activity.getCost() : BigDecimal.ZERO;
                    BigDecimal discount = p.getDiscountAmount() != null ? p.getDiscountAmount() : BigDecimal.ZERO;
                    return cost.subtract(discount);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCostsVal = costs.stream()
                .map(ActivityCost::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setTotalRevenue(paidRevenue.add(pendingRevenue));
        dto.setPaidRevenue(paidRevenue);
        dto.setPendingRevenue(pendingRevenue);
        dto.setTotalCosts(totalCostsVal);
        dto.setNetProfit(dto.getTotalRevenue().subtract(totalCostsVal));

        // Time Stats
        if (activity.getStartDate() != null && activity.getEndDate() != null) {
            long totalDays = ChronoUnit.DAYS.between(activity.getStartDate(), activity.getEndDate());
            long daysPassed = ChronoUnit.DAYS.between(activity.getStartDate(), LocalDate.now());
            if (totalDays > 0) {
                double completion = (double) daysPassed / totalDays * 100;
                dto.setCompletionPercentage(Math.min(100, Math.max(0, completion)));
            }
            dto.setDaysRemaining((int) Math.max(0, totalDays - daysPassed));
            dto.setExpiringSoon(dto.getDaysRemaining() < 7);
        }

        // Spots
        if (activity.getMaxParticipants() != null && activity.getMaxParticipants() > 0) {
            dto.setAvailableSpots(Math.max(0, activity.getMaxParticipants() - dto.getActiveParticipants()));
        } else {
            dto.setAvailableSpots(999); // Unlimited
        }

        // Recent Participants (last 5)
        dto.setRecentParticipants(participants.stream()
                .sorted(Comparator.comparing(ActivityParticipant::getRegistrationDate).reversed())
                .limit(5)
                .collect(Collectors.toList()));

        // Cost Categories
        Map<String, BigDecimal> costsByCategory = costs.stream()
                .collect(Collectors.groupingBy(
                        ActivityCost::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, ActivityCost::getAmount, BigDecimal::add)
                ));
        
        List<ActivityCostSummaryDTO> costSummary = costsByCategory.entrySet().stream()
                .map(e -> {
                    ActivityCostSummaryDTO s = new ActivityCostSummaryDTO();
                    s.setCategory(e.getKey());
                    s.setTotalAmount(e.getValue());
                    return s;
                })
                .sorted(Comparator.comparing(ActivityCostSummaryDTO::getTotalAmount).reversed())
                .collect(Collectors.toList());
        dto.setTopCostCategories(costSummary);

        // Payment Status
        ActivityPaymentStatusDTO paymentStatus = new ActivityPaymentStatusDTO();
        paymentStatus.setTotalPayments(participants.size());
        paymentStatus.setConfirmedPayments((int) participants.stream().filter(ActivityParticipant::isPaid).count());
        paymentStatus.setPendingPayments((int) participants.stream().filter(p -> !p.isPaid()).count());
        if (participants.size() > 0) {
            paymentStatus.setPaidPercentage((double) paymentStatus.getConfirmedPayments() / participants.size() * 100);
        }
        dto.setPaymentStatus(paymentStatus);

        // Performance Metrics
        ActivityPerformanceMetricsDTO metrics = new ActivityPerformanceMetricsDTO();
        if (activity.getMaxParticipants() != null && activity.getMaxParticipants() > 0) {
            metrics.setOccupancyRate((double) dto.getActiveParticipants() / activity.getMaxParticipants() * 100);
        }
        metrics.setDropOutRate(0.0);
        dto.setPerformanceMetrics(metrics);

        return dto;
    }

    public ActivityFinancialSummaryDTO getActivityFinancialSummary(Long activityId) {
        ActivityWithDetailsDTO details = getActivityWithDetails(activityId);
        
        ActivityFinancialSummaryDTO summary = new ActivityFinancialSummaryDTO();
        summary.setActivityId(activityId);
        summary.setActivityName(details.getActivity().getName());
        summary.setTotalRevenue(details.getTotalRevenue());
        summary.setPaidRevenue(details.getPaidRevenue());
        summary.setPendingRevenue(details.getPendingRevenue());
        summary.setTotalCosts(details.getTotalCosts());
        summary.setNetProfit(details.getNetProfit());
        
        if (details.getTotalRevenue().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal margin = details.getNetProfit()
                    .divide(details.getTotalRevenue(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            summary.setProfitMargin(margin.doubleValue());
        } else {
            summary.setProfitMargin(0.0);
        }
        
        summary.setParticipantsCount(details.getTotalParticipants());
        
        if (details.getTotalParticipants() > 0) {
            summary.setAverageFeePerUser(details.getTotalRevenue()
                    .divide(BigDecimal.valueOf(details.getTotalParticipants()), 2, RoundingMode.HALF_UP));
        }

        summary.setCostBreakdown(details.getTopCostCategories());
        
        // Revenue Breakdown (Simplified)
        List<ActivityRevenueSourceDTO> revenueSources = new ArrayList<>();
        ActivityRevenueSourceDTO registrations = new ActivityRevenueSourceDTO();
        registrations.setSource("REGISTRATIONS");
        registrations.setAmount(details.getTotalRevenue());
        registrations.setCount(details.getTotalParticipants());
        revenueSources.add(registrations);
        summary.setRevenueBreakdown(revenueSources);

        return summary;
    }
}
