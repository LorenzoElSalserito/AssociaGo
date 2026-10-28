package com.associago.stats;

import com.associago.event.Event;
import com.associago.event.repository.EventRepository;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.finance.repository.TransactionRepository;
import com.associago.membership.UserAssociation;
import com.associago.membership.repository.UserAssociationRepository;
import com.associago.user.User;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class DashboardOverviewServiceTests {
    @Test
    void overviewUsesAssociationMembershipsAndRealMovements() {
        var members = mock(UserAssociationRepository.class);
        var events = mock(EventRepository.class);
        var transactions = mock(TransactionRepository.class);
        var member = new UserAssociation();
        var user = new User(); user.setFirstName("Elena"); user.setLastName("Verdi");
        member.setUser(user); member.setId(1L); member.setJoinDate(LocalDate.now()); member.setStatus("ACTIVE");
        var income = new Transaction(); income.setId(1L); income.setType(TransactionType.INCOME);
        income.setAmount(new BigDecimal("100.50")); income.setDate(LocalDate.now());
        var expense = new Transaction(); expense.setId(2L); expense.setType(TransactionType.EXPENSE);
        expense.setAmount(new BigDecimal("20.25")); expense.setDate(LocalDate.now());
        var event = new Event(); event.setId(1L); event.setName("Incontro"); event.setStartDatetime(LocalDateTime.now().plusDays(1)); event.setCreatedAt(LocalDateTime.now());
        when(members.findByAssociationId(7L)).thenReturn(List.of(member));
        when(events.findByAssociationId(7L)).thenReturn(List.of(event));
        when(transactions.findByAssociationId(7L)).thenReturn(List.of(income, expense));
        var result = new DashboardOverviewService(members, events, transactions).overview(7L);
        assertThat(((Map<?, ?>) result.get("members")).get("active")).isEqualTo(1L);
        assertThat(((Map<?, ?>) result.get("treasury")).get("balance")).isEqualTo(new BigDecimal("80.25"));
        assertThat((List<?>) result.get("recentActivity")).hasSize(4);
        verify(members).findByAssociationId(7L); verify(events).findByAssociationId(7L); verify(transactions).findByAssociationId(7L);
        verifyNoMoreInteractions(members, events, transactions);
    }
}
