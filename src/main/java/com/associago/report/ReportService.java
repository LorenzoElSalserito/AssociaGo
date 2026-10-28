package com.associago.report;

import com.associago.activity.Activity;
import com.associago.assembly.Assembly;
import com.associago.assembly.AssemblyMotion;
import com.associago.assembly.AssemblyParticipant;
import com.associago.association.Association;
import com.associago.event.Event;
import com.associago.finance.Transaction;
import com.associago.member.Member;
import com.associago.shared.SignatureResolver;
import com.associago.shared.i18n.Messages;
import com.associago.shared.pdf.PdfDocument;
import com.associago.shared.pdf.PdfText;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/** PDFs downloadable from the UI, localized in the request language (A4, Helvetica/WinAnsi). */
@Service
public class ReportService {

    private final Messages messages;

    public ReportService(Messages messages) {
        this.messages = messages;
    }

    // --- Shared layout ---

    private PdfDocument open(Association association, Locale locale) throws IOException {
        return new PdfDocument(PDRectangle.A4, pdf -> header(pdf, association, locale));
    }

    private void header(PdfDocument pdf, Association association, Locale locale) throws IOException {
        float top = pdf.height() - PdfDocument.MARGIN;
        boolean logo = association.getLogo() != null
                && pdf.image(association.getLogo(), "logo", pdf.left(), top - 50, 50, 50);
        float textX = logo ? pdf.left() + 60 : pdf.left();
        String name = Objects.requireNonNullElse(association.getName(), msg(locale, "pdf.associationFallback"));
        pdf.text(textX, top - 22, pdf.fit(name, pdf.bold, 14, pdf.right() - textX), pdf.bold, 14);
        String city = association.getCity() == null ? "" : association.getCity();
        if (!city.isBlank()) pdf.text(textX, top - 38, city, pdf.regular, 9, PdfDocument.MUTED);
        pdf.hLine(pdf.left(), pdf.right(), top - 60, java.awt.Color.LIGHT_GRAY);
        pdf.moveTo(top - 75);
    }

    private PdfDocument.FooterPainter footer(Association association, Locale locale) {
        List<String> parts = new ArrayList<>();
        if (association.getName() != null) parts.add(association.getName());
        if (association.getAddress() != null) {
            parts.add(association.getAddress() + (association.getCity() != null ? ", " + association.getCity() : ""));
        }
        if (association.getTaxCode() != null) parts.add(msg(locale, "pdf.taxCode", association.getTaxCode()));
        if (association.getVatNumber() != null) parts.add(msg(locale, "pdf.vatNumber", association.getVatNumber()));
        if (association.getEmail() != null) parts.add(association.getEmail());
        String text = String.join(" - ", parts);
        return (pdf, page, count) -> {
            String pageLabel = msg(locale, "pdf.page", page, count);
            float pageWidth = pdf.textWidth(pageLabel, pdf.regular, 8);
            pdf.hLine(pdf.left(), pdf.right(), 42, java.awt.Color.LIGHT_GRAY);
            pdf.text(pdf.left(), 30, pdf.fit(text, pdf.regular, 8, pdf.contentWidth() - pageWidth - 20),
                    pdf.regular, 8, PdfDocument.MUTED);
            pdf.text(pdf.right() - pageWidth, 30, pageLabel, pdf.regular, 8, PdfDocument.MUTED);
        };
    }

    private String msg(Locale locale, String code, Object... args) {
        return messages.get(locale, code, args);
    }

    private String orNa(Locale locale, Object value) {
        return value == null || value.toString().isBlank() ? msg(locale, "pdf.notAvailable") : value.toString();
    }

    private static String fullName(String first, String last) {
        return ((first == null ? "" : first) + " " + (last == null ? "" : last)).trim();
    }

    private static BigDecimal amount(Map<String, BigDecimal> summary, String key) {
        if (summary == null) return BigDecimal.ZERO;
        return Objects.requireNonNullElse(summary.get(key), BigDecimal.ZERO);
    }

    // --- Documents ---

    public byte[] generateMembershipCard(Member member, Association association, Locale locale) throws IOException {
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "card.title"), 18);
            pdf.space(6);
            pdf.field(msg(locale, "label.name"), fullName(member.getFirstName(), member.getLastName()));
            pdf.field(msg(locale, "label.fiscalCode"), orNa(locale, member.getFiscalCode()));
            pdf.field(msg(locale, "label.status"), orNa(locale, messages.label(locale, "enum.memberStatus", member.getMembershipStatus())));
            return pdf.finish(footer(association, locale));
        }
    }

    public byte[] generateTransactionReceipt(Transaction transaction, Member member, Association association, Locale locale) throws IOException {
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "receipt.title"), 18);
            pdf.space(6);
            pdf.field(msg(locale, "label.date"), orNa(locale, PdfText.date(transaction.getDate(), locale)));
            pdf.field(msg(locale, "label.description"), Objects.requireNonNullElse(transaction.getDescription(), ""));
            pdf.field(msg(locale, "label.amount"), PdfText.money(transaction.getAmount(), locale));
            pdf.field(msg(locale, "label.paymentMethod"), orNa(locale, transaction.getPaymentMethod()));
            if (member != null) {
                pdf.space(10);
                pdf.field(msg(locale, "label.issuedTo"), fullName(member.getFirstName(), member.getLastName()));
                pdf.field(msg(locale, "label.fiscalCode"), orNa(locale, member.getFiscalCode()));
            }
            pdf.space(30);
            pdf.signatures(null, List.of(new PdfDocument.SignatureBlock(
                    Objects.requireNonNullElse(association.getName(), ""), msg(locale, "pdf.signature"), null)));
            return pdf.finish(footer(association, locale));
        }
    }

    /**
     * Totals come from {@code summary} (incomeCurrent/expenseCurrent); the table lists the given
     * transactions of {@code year} that belong to the association.
     */
    public byte[] generateFinancialReport(int year, Map<String, BigDecimal> summary, List<Transaction> transactions,
                                          Association association, Locale locale) throws IOException {
        BigDecimal income = amount(summary, "incomeCurrent");
        BigDecimal expense = amount(summary, "expenseCurrent");
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "financial.title", String.valueOf(year)), 18);
            pdf.space(6);
            pdf.field(msg(locale, "financial.totalIncome"), PdfText.money(income, locale));
            pdf.field(msg(locale, "financial.totalExpenses"), PdfText.money(expense, locale));
            pdf.field(msg(locale, "financial.net"), PdfText.money(income.subtract(expense), locale));

            List<Transaction> rows = transactions == null ? List.of() : transactions.stream()
                    .filter(t -> t.getDate() != null && t.getDate().getYear() == year)
                    .filter(t -> association.getId() == null || t.getAssociationId() == null
                            || association.getId().equals(t.getAssociationId()))
                    .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                    .toList();
            pdf.space(14);
            pdf.heading(msg(locale, "financial.transactions"), 13);
            if (rows.isEmpty()) {
                pdf.line(msg(locale, "financial.noTransactions"), pdf.italic, 10);
            } else {
                float[] columns = {pdf.left(), pdf.left() + 80, pdf.left() + 330, pdf.left() + 400};
                boolean[] numeric = {false, false, false, true};
                pdf.row(columns, new String[]{msg(locale, "label.date"), msg(locale, "label.description"),
                        msg(locale, "label.type"), msg(locale, "label.amount")}, numeric, pdf.bold, 9);
                pdf.rule();
                for (Transaction t : rows) {
                    pdf.row(columns, new String[]{
                            PdfText.date(t.getDate(), locale),
                            Objects.requireNonNullElse(t.getDescription(), ""),
                            t.getType() == null ? "" : messages.label(locale, "enum.transactionType", t.getType().name()),
                            PdfText.money(t.getAmount(), locale)}, numeric, pdf.regular, 9);
                }
            }
            return pdf.finish(footer(association, locale));
        }
    }

    public byte[] generateComparisonReport(int year1, int year2, Map<String, BigDecimal> summary,
                                           Association association, Locale locale) throws IOException {
        BigDecimal income1 = amount(summary, "incomeYear1");
        BigDecimal expense1 = amount(summary, "expenseYear1");
        BigDecimal income2 = amount(summary, "incomeYear2");
        BigDecimal expense2 = amount(summary, "expenseYear2");
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "comparison.title", String.valueOf(year1), String.valueOf(year2)), 18);
            pdf.space(8);
            float[] columns = {pdf.left(), pdf.left() + 170, pdf.left() + 280, pdf.left() + 390};
            boolean[] numeric = {false, true, true, true};
            pdf.row(columns, new String[]{"", msg(locale, "comparison.year", String.valueOf(year1)),
                    msg(locale, "comparison.year", String.valueOf(year2)), msg(locale, "comparison.difference")}, numeric, pdf.bold, 10);
            pdf.rule();
            comparisonRow(pdf, columns, numeric, msg(locale, "comparison.income"), income1, income2, locale);
            comparisonRow(pdf, columns, numeric, msg(locale, "comparison.expenses"), expense1, expense2, locale);
            comparisonRow(pdf, columns, numeric, msg(locale, "comparison.balance"),
                    income1.subtract(expense1), income2.subtract(expense2), locale);
            return pdf.finish(footer(association, locale));
        }
    }

    private void comparisonRow(PdfDocument pdf, float[] columns, boolean[] numeric, String label,
                               BigDecimal first, BigDecimal second, Locale locale) throws IOException {
        pdf.row(columns, new String[]{label, PdfText.money(first, locale), PdfText.money(second, locale),
                PdfText.money(second.subtract(first), locale)}, numeric, pdf.regular, 10);
    }

    public byte[] generateMemberList(List<Member> members, Association association, Locale locale) throws IOException {
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "members.title"), 16);
            pdf.line(msg(locale, "members.total", PdfText.number(members.size(), locale)), pdf.regular, 10);
            pdf.space(6);
            float[] columns = {pdf.left(), pdf.left() + 25, pdf.left() + 135, pdf.left() + 235, pdf.left() + 350, pdf.left() + 445};
            String[] headers = {msg(locale, "label.number"), msg(locale, "label.lastName"), msg(locale, "label.firstName"),
                    msg(locale, "label.fiscalCode"), msg(locale, "label.email"), msg(locale, "label.status")};
            pdf.row(columns, headers, null, pdf.bold, 9);
            pdf.rule();
            int number = 1;
            for (Member m : members) {
                if (pdf.y() - 14 < 60) {
                    pdf.newPage();
                    pdf.row(columns, headers, null, pdf.bold, 9);
                    pdf.rule();
                }
                pdf.row(columns, new String[]{String.valueOf(number++), m.getLastName(), m.getFirstName(),
                        Objects.requireNonNullElse(m.getFiscalCode(), ""), Objects.requireNonNullElse(m.getEmail(), ""),
                        messages.label(locale, "enum.memberStatus", m.getMembershipStatus())}, null, pdf.regular, 8);
            }
            return pdf.finish(footer(association, locale));
        }
    }

    public byte[] generateEventReport(Event event, int participantCount, Association association, Locale locale) throws IOException {
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "event.reportTitle"), 18);
            pdf.space(6);
            pdf.field(msg(locale, "label.name"), Objects.requireNonNullElse(event.getName(), ""));
            pdf.field(msg(locale, "label.type"), orNa(locale, messages.label(locale, "enum.eventType", event.getType())));
            pdf.field(msg(locale, "label.location"), orNa(locale, event.getLocation()));
            pdf.field(msg(locale, "label.start"), orNa(locale, PdfText.dateTime(event.getStartDatetime(), locale)));
            pdf.field(msg(locale, "label.end"), orNa(locale, PdfText.dateTime(event.getEndDatetime(), locale)));
            pdf.field(msg(locale, "label.status"), orNa(locale, messages.label(locale, "enum.eventStatus", event.getStatus())));
            pdf.field(msg(locale, "label.maxParticipants"), event.getMaxParticipants() != null
                    ? PdfText.number(event.getMaxParticipants(), locale) : msg(locale, "pdf.unlimited"));
            pdf.field(msg(locale, "label.registeredParticipants"), PdfText.number(participantCount, locale));
            pdf.field(msg(locale, "label.costMember"), price(event.getCostMember(), locale));
            pdf.field(msg(locale, "label.costNonMember"), price(event.getCostNonMember(), locale));
            if (event.getDescription() != null && !event.getDescription().isBlank()) {
                pdf.space(12);
                pdf.heading(msg(locale, "label.description"), 12);
                pdf.paragraph(pdf.left(), event.getDescription(), pdf.regular, 10);
            }
            return pdf.finish(footer(association, locale));
        }
    }

    public byte[] generateActivityReport(Activity activity, int participantCount, Association association, Locale locale) throws IOException {
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "activity.reportTitle"), 18);
            pdf.space(6);
            pdf.field(msg(locale, "label.name"), Objects.requireNonNullElse(activity.getName(), ""));
            pdf.field(msg(locale, "label.category"), orNa(locale, messages.label(locale, "enum.activityCategory", activity.getCategory())));
            pdf.field(msg(locale, "label.location"), orNa(locale, activity.getLocation()));
            pdf.field(msg(locale, "label.start"), orNa(locale, PdfText.date(activity.getStartDate(), locale)));
            pdf.field(msg(locale, "label.end"), orNa(locale, PdfText.date(activity.getEndDate(), locale)));
            pdf.field(msg(locale, "label.schedule"), orNa(locale, activity.getScheduleDetails()));
            pdf.field(msg(locale, "label.cost"), price(activity.getCost(), locale));
            pdf.field(msg(locale, "label.maxParticipants"), activity.getMaxParticipants() != null
                    ? PdfText.number(activity.getMaxParticipants(), locale) : msg(locale, "pdf.unlimited"));
            pdf.field(msg(locale, "label.registeredParticipants"), PdfText.number(participantCount, locale));
            pdf.field(msg(locale, "label.status"), msg(locale, activity.isActive() ? "activity.active" : "activity.inactive"));
            return pdf.finish(footer(association, locale));
        }
    }

    private String price(BigDecimal value, Locale locale) {
        return value == null || value.signum() == 0 ? msg(locale, "pdf.free") : PdfText.money(value, locale);
    }

    /**
     * Assembly minutes: details, quorum, present and proxy participants by name, each motion with
     * voting type, votes and outcome, then the chair and secretary signatures.
     *
     * @param memberNames display names keyed by user_associations id (participants and proxy holders)
     * @param signers     president and secretary from {@link SignatureResolver}; their image is drawn only
     *                    when the signer is the person named as chair/secretary of this assembly
     */
    public byte[] generateAssemblyMinutes(Assembly assembly, List<AssemblyParticipant> participants,
                                          Map<Long, String> memberNames, List<AssemblyMotion> motions,
                                          List<SignatureResolver.SignerInfo> signers,
                                          Association association, Locale locale) throws IOException {
        List<AssemblyParticipant> all = participants == null ? List.of() : participants;
        Map<Long, String> names = memberNames == null ? Map.of() : memberNames;
        try (PdfDocument pdf = open(association, locale)) {
            pdf.heading(msg(locale, "minutes.title"), 18);
            pdf.space(4);
            pdf.field(msg(locale, "label.title"), Objects.requireNonNullElse(assembly.getTitle(), ""));
            if (assembly.getType() != null) {
                pdf.field(msg(locale, "label.type"), messages.label(locale, "enum.assemblyType", assembly.getType()));
            }
            pdf.field(msg(locale, "label.date"), orNa(locale, PdfText.dateTime(assembly.getDate(), locale)));
            pdf.field(msg(locale, "label.location"), orNa(locale, assembly.getLocation()));
            pdf.field(msg(locale, "minutes.chair"), orNa(locale, assembly.getPresident()));
            pdf.field(msg(locale, "minutes.secretary"), orNa(locale, assembly.getSecretary()));

            pdf.space(10);
            pdf.heading(msg(locale, "minutes.quorum"), 13);
            if (assembly.getFirstCallQuorum() != null) {
                pdf.line(msg(locale, "minutes.quorumFirstCall", percent(assembly.getFirstCallQuorum(), locale)), pdf.regular, 10);
            }
            if (assembly.getSecondCallQuorum() != null) {
                pdf.line(msg(locale, "minutes.quorumSecondCall", percent(assembly.getSecondCallQuorum(), locale)), pdf.regular, 10);
            }
            pdf.line(msg(locale, assembly.isQuorumReached() ? "minutes.quorumReached" : "minutes.quorumNotReached"), pdf.bold, 10);

            pdf.space(10);
            pdf.heading(msg(locale, "minutes.participants"), 13);
            List<String> present = new ArrayList<>();
            List<String> proxies = new ArrayList<>();
            for (AssemblyParticipant p : all) {
                String name = nameOf(names, p.getUserAssociationId(), locale);
                if ("PRESENT".equals(p.getParticipationType())) {
                    present.add(name);
                } else if ("PROXY".equals(p.getParticipationType())) {
                    proxies.add(p.getProxyReceiverId() != null
                            ? msg(locale, "minutes.proxyHolder", name, nameOf(names, p.getProxyReceiverId(), locale))
                            : name);
                }
            }
            participantList(pdf, msg(locale, "minutes.present", PdfText.number(present.size(), locale)), present, locale);
            participantList(pdf, msg(locale, "minutes.proxies", PdfText.number(proxies.size(), locale)), proxies, locale);

            pdf.space(10);
            pdf.heading(msg(locale, "minutes.motions"), 13);
            List<AssemblyMotion> ordered = motions == null ? List.of() : motions.stream()
                    .sorted((a, b) -> Integer.compare(Objects.requireNonNullElse(a.getOrderNumber(), 0),
                            Objects.requireNonNullElse(b.getOrderNumber(), 0)))
                    .toList();
            if (ordered.isEmpty()) pdf.line(msg(locale, "minutes.noMotions"), pdf.italic, 10);
            for (AssemblyMotion motion : ordered) {
                pdf.ensureSpace(70);
                pdf.space(4);
                String number = motion.getOrderNumber() != null ? motion.getOrderNumber() + ". " : "- ";
                pdf.paragraph(pdf.left(), number + Objects.requireNonNullElse(motion.getTitle(), ""), pdf.bold, 11);
                if (motion.getDescription() != null && !motion.getDescription().isBlank()) {
                    pdf.paragraph(pdf.left() + 14, motion.getDescription(), pdf.regular, 9);
                }
                String votingType = motion.getVotingType() == null ? "SIMPLE" : motion.getVotingType();
                pdf.line(pdf.left() + 14, msg(locale, "minutes.votingType",
                        messages.label(locale, "enum.votingType", votingType)), pdf.regular, 10);
                if (motion.isVoteRecorded() && !AssemblyMotion.OUTCOME_NOTED.equals(motion.getOutcome())) {
                    pdf.line(pdf.left() + 14, msg(locale, "minutes.votes",
                            PdfText.number(Objects.requireNonNullElse(motion.getVotesInFavor(), 0), locale),
                            PdfText.number(Objects.requireNonNullElse(motion.getVotesAgainst(), 0), locale),
                            PdfText.number(Objects.requireNonNullElse(motion.getVotesAbstain(), 0), locale)), pdf.regular, 10);
                }
                pdf.line(pdf.left() + 14, msg(locale, "minutes.outcome",
                        messages.label(locale, "enum.outcome", motion.getOutcome())), pdf.bold, 10);
                if (motion.getDecisionSummary() != null && !motion.getDecisionSummary().isBlank()) {
                    pdf.paragraph(pdf.left() + 14, msg(locale, "minutes.decision", motion.getDecisionSummary()), pdf.italic, 10);
                }
            }

            pdf.space(20);
            pdf.signatures(msg(locale, "pdf.signatures"), List.of(
                    minutesSigner(assembly.getPresident(), "minutes.chair", find(signers, "president"), locale),
                    minutesSigner(assembly.getSecretary(), "minutes.secretary", find(signers, "secretary"), locale)));
            return pdf.finish(footer(association, locale));
        }
    }

    private String nameOf(Map<Long, String> names, Long id, Locale locale) {
        String name = id == null ? null : names.get(id);
        return name == null || name.isBlank() ? "#" + (id == null ? "?" : id) : name;
    }

    private void participantList(PdfDocument pdf, String title, Collection<String> names, Locale locale) throws IOException {
        pdf.line(title, pdf.bold, 10);
        String text = names.isEmpty() ? msg(locale, "minutes.none") : String.join(", ", names.stream().sorted().toList());
        pdf.paragraph(pdf.left() + 14, text, pdf.regular, 10);
    }

    private static String percent(Double value, Locale locale) {
        DecimalFormat format = new DecimalFormat("0.##", DecimalFormatSymbols.getInstance(locale));
        return format.format(value);
    }

    private static SignatureResolver.SignerInfo find(List<SignatureResolver.SignerInfo> signers, String role) {
        if (signers == null) return null;
        return signers.stream().filter(s -> role.equalsIgnoreCase(s.role())).findFirst().orElse(null);
    }

    /**
     * The assembly may be chaired by someone other than the association officer: the stored signature
     * is used only when it belongs to the person named in the minutes (or no one is named).
     */
    private PdfDocument.SignatureBlock minutesSigner(String assemblyName, String roleKey,
                                                     SignatureResolver.SignerInfo signer, Locale locale) {
        String role = msg(locale, roleKey);
        boolean named = assemblyName != null && !assemblyName.isBlank();
        if (signer == null || !signer.hasName()) {
            return new PdfDocument.SignatureBlock(named ? assemblyName : "", role, null);
        }
        boolean samePerson = !named || normalize(assemblyName).equals(normalize(signer.fullName()));
        return new PdfDocument.SignatureBlock(named ? assemblyName : signer.fullName(), role,
                samePerson ? signer.imageBytes() : null);
    }

    private static String normalize(String name) {
        return name.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }
}
