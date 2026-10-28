package com.associago.stats;

import com.associago.event.repository.EventRepository;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.finance.repository.TransactionRepository;
import com.associago.membership.repository.UserAssociationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Dashboard reads the same memberships as the members page, within the selected association. */
@Service
public class DashboardOverviewService {
    private final UserAssociationRepository memberships;
    private final EventRepository events;
    private final TransactionRepository transactions;

    public DashboardOverviewService(UserAssociationRepository memberships, EventRepository events,
                                    TransactionRepository transactions) {
        this.memberships = memberships;
        this.events = events;
        this.transactions = transactions;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> overview(Long associationId) {
        var now = LocalDateTime.now();
        var start = LocalDate.now().withDayOfMonth(1);
        var end = start.plusMonths(1);
        var people = memberships.findByAssociationId(associationId);
        var movements = transactions.findByAssociationId(associationId);
        var associationEvents = events.findByAssociationId(associationId);
        var upcoming = associationEvents.stream().filter(event -> event.getStartDatetime() != null
                && event.getStartDatetime().isAfter(now) && !"CANCELLED".equals(event.getStatus()))
                .sorted(Comparator.comparing(com.associago.event.Event::getStartDatetime)).toList();
        Map<String, Object> result = new HashMap<>();
        result.put("members", Map.of("total", people.size(), "active", people.stream()
                .filter(member -> "ACTIVE".equals(member.getStatus())).count(), "newThisMonth", people.stream()
                .filter(member -> member.getJoinDate() != null && !member.getJoinDate().isBefore(start)
                        && member.getJoinDate().isBefore(end)).count()));
        var monthMovements = movements.stream().filter(item -> item.getDate() != null
                && !item.getDate().isBefore(start) && item.getDate().isBefore(end)).toList();
        result.put("treasury", Map.of("balance", sum(movements, TransactionType.INCOME).subtract(sum(movements, TransactionType.EXPENSE)),
                "incomeMonth", sum(monthMovements, TransactionType.INCOME), "expenseMonth", sum(monthMovements, TransactionType.EXPENSE)));
        Map<String, Object> eventStats = new HashMap<>();
        eventStats.put("upcoming", upcoming.size());
        eventStats.put("nextEvent", upcoming.isEmpty() ? null : Map.of("title", upcoming.getFirst().getName(), "date", upcoming.getFirst().getStartDatetime()));
        result.put("events", eventStats);
        List<Map<String, Object>> recent = new ArrayList<>();
        people.forEach(member -> recent.add(entry("member-" + member.getId(), "MEMBER_NEW",
                member.getUser().getFirstName() + " " + member.getUser().getLastName(), member.getCreatedAt())));
        associationEvents.forEach(event -> recent.add(entry("event-" + event.getId(), "EVENT", event.getName(), event.getCreatedAt())));
        movements.forEach(item -> recent.add(entry("payment-" + item.getId(), "PAYMENT", item.getDescription(), item.getCreatedAt())));
        result.put("recentActivity", recent.stream().filter(item -> item.get("date") != null)
                .sorted(Comparator.comparing((Map<String, Object> item) -> (LocalDateTime) item.get("date")).reversed()).limit(20).toList());
        return result;
    }

    private BigDecimal sum(List<Transaction> items, TransactionType type) {
        return items.stream().filter(item -> item.getType() == type && item.getAmount() != null)
                .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<String, Object> entry(String id, String type, String description, LocalDateTime date) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("id", id); entry.put("type", type); entry.put("description", description == null ? "—" : description); entry.put("date", date);
        return entry;
    }
}
