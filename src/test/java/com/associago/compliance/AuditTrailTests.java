package com.associago.compliance;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.finance.repository.TransactionRepository;
import com.associago.user.User;
import com.associago.user.UserService;
import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AuditTrailTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired private AuditService auditService;
    @Autowired private AuditLogRepository auditRepository;
    @Autowired private AssociationService associationService;
    @Autowired private UserService userService;
    @Autowired private TransactionRepository transactionRepository;

    @AfterEach
    void clearRequest() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void memberAndTransactionChangesAreRecordedPerAssociationWithoutSecrets() {
        Association association = association("Audit");
        Association other = association("Altra");

        // Members carry no association column: it comes from the renderer's X-Association-Id header.
        asRequestFor(association);
        User member = new User();
        member.setFirstName("Ada");
        member.setLastName("Audit");
        member = userService.save(member);
        member.setEmail("ada@example.invalid");
        member = userService.save(member);
        Long memberId = member.getId();
        userService.deleteById(memberId);

        // Transactions carry their own association, which wins over the header.
        Transaction tx = new Transaction();
        tx.setAssociationId(other.getId());
        tx.setDate(LocalDate.now());
        tx.setAmount(new BigDecimal("12.50"));
        tx.setType(TransactionType.INCOME);
        tx.setDescription("Quota");
        tx = transactionRepository.save(tx);
        tx.setAmount(new BigDecimal("15.00"));
        Long txId = transactionRepository.save(tx).getId();
        transactionRepository.deleteById(txId);

        Association changed = associationService.findById(association.getId()).orElseThrow();
        changed.setPassword("another-secret");
        changed.setDbPassword("db-secret");
        changed.setDbUser("root");
        changed.setLogo(new byte[] {1, 2, 3});
        changed.setCity("Bologna");
        associationService.update(association.getId(), changed);

        List<AuditEntry> mine = auditService.search(association.getId(), null, null, null, null, 0, 100).getContent();
        List<AuditEntry> members = entries(mine, "User", memberId);
        assertThat(members).extracting(AuditEntry::getAction).containsExactlyInAnyOrder("CREATE", "UPDATE", "DELETE");
        assertThat(members).allSatisfy(e -> assertThat(e.getArea()).isEqualTo("MEMBERS"));
        assertThat(members).filteredOn(e -> "UPDATE".equals(e.getAction()))
                .extracting(AuditEntry::getDescription).containsExactly("email");
        assertThat(entries(mine, "Transaction", txId)).isEmpty();

        List<AuditEntry> others = auditService.search(other.getId(), "FINANCE", null, null, null, 0, 100).getContent();
        List<AuditEntry> txs = entries(others, "Transaction", txId);
        assertThat(txs).extracting(AuditEntry::getAction).containsExactlyInAnyOrder("CREATE", "UPDATE", "DELETE");
        assertThat(txs).filteredOn(e -> "UPDATE".equals(e.getAction()))
                .extracting(AuditEntry::getDescription).containsExactly("amount");
        assertThat(auditService.search(other.getId(), "MEMBERS", null, null, null, 0, 100).getContent())
                .noneMatch(e -> "User".equals(e.getEntityType()) && memberId.equals(e.getEntityId()));
        assertThat(auditService.search(other.getId(), null, "DELETE", null, null, 0, 100).getContent())
                .allMatch(e -> "DELETE".equals(e.getAction())).isNotEmpty();
        assertThat(auditService.search(other.getId(), null, null, LocalDate.now().plusDays(1).atStartOfDay(), null, 0, 100)
                .getContent()).isEmpty();

        AuditEntry profile = entries(mine, "Association", association.getId()).stream()
                .filter(e -> "UPDATE".equals(e.getAction())).findFirst().orElseThrow();
        assertThat(profile.getDescription()).contains("city")
                .doesNotContainIgnoringCase("password").doesNotContain("dbUser").doesNotContain("logo");
        assertThat(auditRepository.findAll()).allSatisfy(e -> {
            assertThat(e.getOldValue()).isNull();
            assertThat(e.getNewValue()).isNull();
            assertThat(String.valueOf(e.getDescription())).doesNotContain("secret").doesNotContain("root");
        });

        // The log must never block deleting the association it belongs to.
        associationService.delete(other.getId());
        assertThat(auditService.countByAssociation(other.getId())).isZero();
    }

    private static List<AuditEntry> entries(List<AuditEntry> entries, String type, Long id) {
        return entries.stream().filter(e -> type.equals(e.getEntityType()) && id.equals(e.getEntityId())).toList();
    }

    private static void asRequestFor(Association association) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Association-Id", association.getId().toString());
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    private Association association(String prefix) {
        String marker = UUID.randomUUID().toString().substring(0, 8);
        Association association = new Association();
        association.setName(prefix + " " + marker);
        association.setSlug(prefix.toLowerCase() + "-" + marker);
        association.setEmail(prefix.toLowerCase() + marker + "@example.invalid");
        association.setPassword("audit-password");
        association.setType("APS");
        return associationService.create(association);
    }
}
