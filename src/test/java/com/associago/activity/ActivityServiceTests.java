package com.associago.activity;

import com.associago.activity.repository.ActivityCostRepository;
import com.associago.activity.repository.ActivityInstructorRepository;
import com.associago.activity.repository.ActivityParticipantRepository;
import com.associago.activity.repository.ActivityRepository;
import com.associago.activity.repository.ActivityScheduleRepository;
import com.associago.stats.dto.ActivityFinancialSummaryDTO;
import com.associago.stats.dto.ActivityWithDetailsDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTests {

    @Mock private ActivityRepository activityRepository;
    @Mock private ActivityParticipantRepository participantRepository;
    @Mock private ActivityCostRepository costRepository;
    @Mock private ActivityInstructorRepository instructorRepository;
    @Mock private ActivityScheduleRepository scheduleRepository;

    private ActivityService service;

    @BeforeEach
    void setUp() {
        service = new ActivityService(activityRepository, participantRepository, costRepository,
                instructorRepository, scheduleRepository);
    }

    @Test
    void detailsCalculateParticipantsRevenueCostsAndCapacity() {
        Activity activity = activity();
        when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
        when(participantRepository.findByActivityId(1L)).thenReturn(List.of(
                participant(true, true, "80.00", "0.00", LocalDate.now()),
                participant(true, false, "0.00", "10.00", LocalDate.now().minusDays(1)),
                participant(false, false, "0.00", "0.00", LocalDate.now().minusDays(2))
        ));
        when(costRepository.findByActivityId(1L)).thenReturn(List.of(
                cost("RENT", "50.00"), cost("RENT", "25.00"), cost("STAFF", "40.00")
        ));
        when(instructorRepository.findByActivityId(1L)).thenReturn(List.of());

        ActivityWithDetailsDTO details = service.getActivityWithDetails(1L);

        assertThat(details.getTotalParticipants()).isEqualTo(3);
        assertThat(details.getActiveParticipants()).isEqualTo(2);
        assertThat(details.getPendingParticipants()).isEqualTo(1);
        assertThat(details.getPaidRevenue()).isEqualByComparingTo("80.00");
        assertThat(details.getPendingRevenue()).isEqualByComparingTo("190.00");
        assertThat(details.getTotalCosts()).isEqualByComparingTo("115.00");
        assertThat(details.getNetProfit()).isEqualByComparingTo("155.00");
        assertThat(details.getAvailableSpots()).isEqualTo(8);
        assertThat(details.getTopCostCategories().getFirst().getCategory()).isEqualTo("RENT");
        assertThat(details.getPaymentStatus().getConfirmedPayments()).isEqualTo(1);
        assertThat(details.getPerformanceMetrics().getOccupancyRate()).isEqualTo(20.0);
    }

    @Test
    void financialSummaryCalculatesMarginAndAverageFee() {
        Activity activity = activity();
        when(activityRepository.findById(1L)).thenReturn(Optional.of(activity));
        when(participantRepository.findByActivityId(1L)).thenReturn(List.of(
                participant(true, true, "100.00", "0.00", LocalDate.now())
        ));
        when(costRepository.findByActivityId(1L)).thenReturn(List.of(cost("RENT", "25.00")));
        when(instructorRepository.findByActivityId(1L)).thenReturn(List.of());

        ActivityFinancialSummaryDTO summary = service.getActivityFinancialSummary(1L);

        assertThat(summary.getProfitMargin()).isEqualTo(75.0);
        assertThat(summary.getAverageFeePerUser()).isEqualByComparingTo("100.00");
        assertThat(summary.getRevenueBreakdown()).hasSize(1);
    }

    private Activity activity() {
        Activity activity = new Activity();
        activity.setId(1L);
        activity.setName("Corso");
        activity.setCost(new BigDecimal("100.00"));
        activity.setMaxParticipants(10);
        activity.setStartDate(LocalDate.now().minusDays(10));
        activity.setEndDate(LocalDate.now().plusDays(10));
        return activity;
    }

    private ActivityParticipant participant(boolean active, boolean paid, String amount, String discount,
                                            LocalDate registrationDate) {
        ActivityParticipant participant = new ActivityParticipant();
        participant.setActive(active);
        participant.setPaid(paid);
        participant.setAmountPaid(new BigDecimal(amount));
        participant.setDiscountAmount(new BigDecimal(discount));
        participant.setRegistrationDate(registrationDate);
        return participant;
    }

    private ActivityCost cost(String category, String amount) {
        ActivityCost cost = new ActivityCost();
        cost.setCategory(category);
        cost.setAmount(new BigDecimal(amount));
        return cost;
    }
}
