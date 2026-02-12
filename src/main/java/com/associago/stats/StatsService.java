package com.associago.stats;

import com.associago.activity.Activity;
import com.associago.activity.repository.ActivityCostRepository;
import com.associago.activity.repository.ActivityParticipantRepository;
import com.associago.activity.repository.ActivityRepository;
import com.associago.assembly.repository.AssemblyRepository;
import com.associago.event.Event;
import com.associago.event.repository.EventRepository;
import com.associago.finance.TransactionType;
import com.associago.finance.repository.TransactionRepository;
import com.associago.member.repository.MemberRepository;
import com.associago.stats.dto.ActivityStatsDTO;
import com.associago.stats.dto.AssemblyStatsDTO;
import com.associago.stats.dto.FinancialStatsDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;
    private final TransactionRepository transactionRepository;
    private final ActivityRepository activityRepository;
    private final ActivityParticipantRepository activityParticipantRepository;
    private final ActivityCostRepository activityCostRepository;
    private final AssemblyRepository assemblyRepository;

    public StatsService(MemberRepository memberRepository,
                        EventRepository eventRepository,
                        TransactionRepository transactionRepository,
                        ActivityRepository activityRepository,
                        ActivityParticipantRepository activityParticipantRepository,
                        ActivityCostRepository activityCostRepository,
                        AssemblyRepository assemblyRepository) {
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
        this.transactionRepository = transactionRepository;
        this.activityRepository = activityRepository;
        this.activityParticipantRepository = activityParticipantRepository;
        this.activityCostRepository = activityCostRepository;
        this.assemblyRepository = assemblyRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        // --- Members ---
        Map<String, Object> members = new HashMap<>();
        members.put("total", memberRepository.count());
        members.put("active", memberRepository.countByMembershipStatus("ACTIVE"));
        members.put("newThisMonth", memberRepository.countByCreatedAtBetween(startOfMonth.atStartOfDay(), endOfMonth.atTime(23, 59, 59)));
        stats.put("members", members);

        // --- Treasury ---
        Map<String, Object> treasury = new HashMap<>();
        
        LocalDate farPast = LocalDate.of(1900, 1, 1);
        LocalDate farFuture = LocalDate.of(2100, 12, 31);

        BigDecimal totalIncome = transactionRepository.sumByTypeAndDateRange(TransactionType.INCOME, farPast, farFuture);
        BigDecimal totalExpense = transactionRepository.sumByTypeAndDateRange(TransactionType.EXPENSE, farPast, farFuture);
        
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;
        
        treasury.put("balance", totalIncome.subtract(totalExpense));
        
        BigDecimal incomeMonth = transactionRepository.sumByTypeAndDateRange(TransactionType.INCOME, startOfMonth, endOfMonth);
        BigDecimal expenseMonth = transactionRepository.sumByTypeAndDateRange(TransactionType.EXPENSE, startOfMonth, endOfMonth);
        treasury.put("incomeMonth", incomeMonth != null ? incomeMonth : BigDecimal.ZERO);
        treasury.put("expenseMonth", expenseMonth != null ? expenseMonth : BigDecimal.ZERO);
        stats.put("treasury", treasury);

        // --- Events ---
        Map<String, Object> events = new HashMap<>();
        events.put("upcoming", eventRepository.countByStartDatetimeAfter(now));
        Event nextEvent = eventRepository.findFirstByStartDatetimeAfterOrderByStartDatetimeAsc(now);
        if (nextEvent != null) {
            Map<String, Object> nextEventMap = new HashMap<>();
            nextEventMap.put("title", nextEvent.getName());
            nextEventMap.put("date", nextEvent.getStartDatetime());
            events.put("nextEvent", nextEventMap);
        } else {
            events.put("nextEvent", null);
        }
        stats.put("events", events);

        // --- Recent Activity ---
        List<Map<String, Object>> recentActivity = new ArrayList<>();
        stats.put("recentActivity", recentActivity);

        return stats;
    }
    
    public Map<String, Object> getGeneralStats() {
        return getDashboardStats();
    }

    public ActivityStatsDTO getActivityStats(Long activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        ActivityStatsDTO stats = new ActivityStatsDTO();
        stats.setActivityId(activity.getId());
        stats.setActivityName(activity.getName());
        stats.setMaxParticipants(activity.getMaxParticipants());

        // Participants
        Integer totalParticipants = activityParticipantRepository.countByActivityId(activityId);
        stats.setTotalParticipants(totalParticipants);

        // Revenue (Sum of payments from participants)
        // Note: Assuming we have a method to sum payments. If not, we iterate or use a custom query.
        // For now, let's assume a custom query exists or we implement it.
        // BigDecimal totalRevenue = activityParticipantRepository.sumAmountPaidByActivityId(activityId);
        // Fallback:
        BigDecimal totalRevenue = BigDecimal.ZERO; // Placeholder, needs repo method
        stats.setTotalRevenue(totalRevenue);

        // Costs
        // BigDecimal totalCosts = activityCostRepository.sumAmountByActivityId(activityId);
        BigDecimal totalCosts = BigDecimal.ZERO; // Placeholder
        stats.setTotalCosts(totalCosts);

        // Net Profit
        stats.setNetProfit(totalRevenue.subtract(totalCosts));

        // Margins
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            stats.setProfitMargin(stats.getNetProfit().divide(totalRevenue, 2, RoundingMode.HALF_UP).doubleValue() * 100);
        } else {
            stats.setProfitMargin(0.0);
        }

        // Occupancy
        if (activity.getMaxParticipants() != null && activity.getMaxParticipants() > 0) {
            stats.setOccupancyRate((double) totalParticipants / activity.getMaxParticipants() * 100);
        } else {
            stats.setOccupancyRate(0.0);
        }

        return stats;
    }

    public AssemblyStatsDTO getAssemblyStats(Long assemblyId) {
        // Placeholder implementation
        return new AssemblyStatsDTO();
    }

    public FinancialStatsDTO getFinancialStats(Long associationId, int year) {
        // Placeholder implementation
        return new FinancialStatsDTO();
    }
}
