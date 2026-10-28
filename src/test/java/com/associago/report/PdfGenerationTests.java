package com.associago.report;

import com.associago.activity.Activity;
import com.associago.assembly.Assembly;
import com.associago.assembly.AssemblyMotion;
import com.associago.assembly.AssemblyParticipant;
import com.associago.association.Association;
import com.associago.balance.AnnualBalance;
import com.associago.balance.AnnualBalanceLine;
import com.associago.balance.AnnualBalanceRepository;
import com.associago.balance.AnnualBalanceService;
import com.associago.certificate.CertificateService;
import com.associago.certificate.CertificateTemplate;
import com.associago.certificate.IssuedCertificate;
import com.associago.event.Event;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.member.Member;
import com.associago.shared.SignatureResolver;
import com.associago.shared.i18n.Messages;
import com.associago.shared.pdf.PdfText;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.imageio.ImageIO;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/** Every PDF the UI can download must render, localized, with realistic data. */
class PdfGenerationTests {

    private static final Locale SPANISH = Locale.forLanguageTag("es");

    private final Messages messages = Messages.standalone();
    private final ReportService reports = new ReportService(messages);

    @ParameterizedTest
    @ValueSource(strings = {"it", "en", "es"})
    void reportServiceGeneratesEveryDocumentLocalized(String language) throws Exception {
        Locale locale = Locale.forLanguageTag(language);
        Association association = association();
        Member member = member();

        Transaction transaction = new Transaction();
        transaction.setAssociationId(1L);
        transaction.setDate(LocalDate.of(2026, 3, 1));
        transaction.setAmount(new BigDecimal("1234.56"));
        transaction.setType(TransactionType.INCOME);
        transaction.setCategory("Quote");
        transaction.setDescription("Quota associativa – rinnovo “annuale”");

        Activity activity = new Activity();
        activity.setId(1L);
        activity.setName("Laboratorio di ceramica");
        activity.setCategory("COURSE");
        activity.setStartDate(LocalDate.of(2026, 1, 10));
        activity.setCost(new BigDecimal("25.00"));

        Event event = new Event();
        event.setId(1L);
        event.setName("Festa d'autunno");
        event.setType("PARTY");
        event.setStartDatetime(LocalDateTime.of(2026, 10, 31, 18, 0));
        event.setDescription("Una serata insieme.\nPortate un dolce!");

        Map<String, BigDecimal> summary = Map.of(
                "incomeCurrent", new BigDecimal("1234.56"), "expenseCurrent", new BigDecimal("80.50"),
                "incomeYear1", new BigDecimal("100"), "expenseYear1", new BigDecimal("50"),
                "incomeYear2", new BigDecimal("200"), "expenseYear2", new BigDecimal("75"));

        String card = text(reports.generateMembershipCard(member, association, locale));
        assertThat(card).contains(messages.get(locale, "card.title"), messages.get(locale, "enum.memberStatus.ACTIVE"));

        String receipt = text(reports.generateTransactionReceipt(transaction, member, association, locale));
        assertThat(receipt).contains(messages.get(locale, "receipt.title"), PdfText.sanitize(PdfText.money(transaction.getAmount(), locale)));

        String financial = text(reports.generateFinancialReport(2026, summary, List.of(transaction), association, locale));
        assertThat(financial).contains(messages.get(locale, "financial.totalIncome"), "Quota associativa",
                messages.get(locale, "enum.transactionType.INCOME"));

        String comparison = text(reports.generateComparisonReport(2025, 2026, summary, association, locale));
        assertThat(comparison).contains(messages.get(locale, "comparison.title", "2025", "2026"), "2026");

        String list = text(reports.generateMemberList(List.of(member), association, locale));
        assertThat(list).contains(messages.get(locale, "members.title"), "D'Amato");

        String eventPdf = text(reports.generateEventReport(event, 3, association, locale));
        assertThat(eventPdf).contains(messages.get(locale, "event.reportTitle"), messages.get(locale, "enum.eventType.PARTY"), "Portate un dolce!");

        String activityPdf = text(reports.generateActivityReport(activity, 2, association, locale));
        assertThat(activityPdf).contains(messages.get(locale, "activity.reportTitle"), messages.get(locale, "enum.activityCategory.COURSE"));

        String minutes = text(minutes(locale, List.of()));
        assertThat(minutes).contains(messages.get(locale, "minutes.title"));
    }

    @Test
    void labelsDifferBetweenItalianAndEnglish() throws Exception {
        Map<String, BigDecimal> summary = Map.of("incomeCurrent", new BigDecimal("1234.56"));
        String it = text(reports.generateFinancialReport(2026, summary, List.of(), association(), Locale.ITALIAN));
        String en = text(reports.generateFinancialReport(2026, summary, List.of(), association(), Locale.ENGLISH));
        assertThat(it).contains("Totale entrate", "1.234,56", "Pagina 1 di 1").doesNotContain("Total income");
        assertThat(en).contains("Total income", "1,234.56", "Page 1 of 1").doesNotContain("Totale entrate");
    }

    @Test
    void assemblyMinutesListParticipantsVotesAndOutcomes() throws Exception {
        byte[] signature = signaturePng();
        List<SignatureResolver.SignerInfo> signers = List.of(
                new SignatureResolver.SignerInfo("president", "Anna", "Rossi", null, null, signature),
                new SignatureResolver.SignerInfo("secretary", "Luca", "Verdi", null, null, signature));

        String it = text(minutes(Locale.ITALIAN, signers));
        assertThat(it).contains("Giulia Bianchi", "Marco Neri", "Paolo Gallo", "Presenti (2)", "Per delega (1)", "delega a Giulia Bianchi")
                .contains("Approvazione bilancio", "Maggioranza semplice", "Favorevoli 10 - Contrari 2 - Astenuti 1", "Esito: Approvata")
                .contains("Modifica statuto", "Maggioranza qualificata (2/3)", "Esito: Respinta")
                .contains("Esito: Presa d'atto", "Esito: In attesa di voto")
                .contains("Quorum raggiunto", "Prima convocazione: 50%")
                .contains("Anna Rossi", "Luca Verdi");

        byte[] english = minutes(Locale.ENGLISH, signers);
        assertThat(text(english)).contains("Present (2)", "By proxy (1)", "Outcome: Approved", "Outcome: Rejected", "Outcome: Noted",
                "Qualified majority (2/3)", "For 10 - Against 2 - Abstained 1", "Quorum reached");
        // Chair and secretary match the stored signers: both images are drawn.
        assertThat(imageCount(english)).isEqualTo(2);
    }

    @Test
    void minutesSkipSignatureImageOfADifferentPerson() throws Exception {
        List<SignatureResolver.SignerInfo> signers = List.of(
                new SignatureResolver.SignerInfo("president", "Someone", "Else", null, null, signaturePng()));
        byte[] pdf = minutes(Locale.ITALIAN, signers);
        assertThat(imageCount(pdf)).isZero();
        assertThat(text(pdf)).contains("Anna Rossi");
    }

    @Test
    void annualBalancePdfIsA4LocalizedAndSigned() throws Exception {
        AnnualBalance balance = new AnnualBalance();
        balance.setYear(2026);
        balance.setTitle("Bilancio 2026");
        balance.setStatus("COMPUTED");
        balance.setNetResult(new BigDecimal("39.50"));
        AnnualBalanceLine line = new AnnualBalanceLine();
        line.setSection("INCOME");
        line.setLabel("Quote associative");
        line.setAmount(new BigDecimal("120.00"));
        AnnualBalanceLine total = new AnnualBalanceLine();
        total.setSection("INCOME");
        total.setLabel("TOTALE ENTRATE");
        total.setSubtotal(true);
        total.setAmount(new BigDecimal("120.00"));
        List<SignatureResolver.SignerInfo> signers = List.of(
                new SignatureResolver.SignerInfo("president", "Anna", "Rossi", null, null, signaturePng()),
                new SignatureResolver.SignerInfo("secretary", "Luca", "Verdi", "Segretaria generale", null, null),
                new SignatureResolver.SignerInfo("treasurer", "Elena", "Neri", null, null, "not an image".getBytes(StandardCharsets.UTF_8)));

        AnnualBalanceRepository repository = Mockito.mock(AnnualBalanceRepository.class);
        Mockito.when(repository.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));
        AnnualBalanceService service = new AnnualBalanceService(repository, null, null, messages);

        byte[] italian = service.generatePdf(balance, List.of(line, total), association(), signers, Locale.ITALIAN);
        assertThat(text(italian)).contains("BILANCIO CONSUNTIVO 2026", "TOTALE ENTRATE", "AVANZO DI GESTIONE", "120,00",
                "Anna Rossi", "Presidente", "Segretaria generale", "Elena Neri", "Tesoriere");
        // Only the valid image is embedded; the corrupt one is skipped without failing.
        assertThat(imageCount(italian)).isEqualTo(1);
        try (PDDocument document = Loader.loadPDF(italian)) {
            PDRectangle box = document.getPage(0).getMediaBox();
            assertThat(box.getWidth()).isEqualTo(PDRectangle.A4.getWidth());
            assertThat(box.getHeight()).isEqualTo(PDRectangle.A4.getHeight());
        }
        assertThat(balance.getChecksum()).hasSize(64);

        String german = text(service.generatePdf(balance, List.of(line, total), association(), signers, Locale.GERMAN));
        assertThat(german).contains("JAHRESABSCHLUSS 2026", "EINNAHMEN GESAMT", "Präsident/in", "Kassenwart/in");
        assertThat(text(service.generatePdf(balance, List.of(line, total), association(), List.of(), Locale.ENGLISH)))
                .contains("TOTAL INCOME", "OPERATING SURPLUS");
    }

    @Test
    void certificatePdfDrawsTemplateSignatories() throws Exception {
        CertificateService service = new CertificateService(null, null, null, null, null, null, null, messages);
        CertificateTemplate template = new CertificateTemplate();
        template.setOrientation("LANDSCAPE");
        template.setSignatoryRoles("[\"PRESIDENT\",\"TREASURER\"]");
        IssuedCertificate cert = new IssuedCertificate();
        cert.setTitle("Attestato di partecipazione");
        cert.setCertificateNumber("CERT-2026-0001");
        cert.setIssueDate(LocalDate.of(2026, 5, 4));
        cert.setBodySnapshot("<p>Si attesta che <b>Niccolò D'Amato</b> ha partecipato.</p><p>Grazie!</p>");
        cert.setQrCodeData("{\"cert\":\"CERT-2026-0001\"}");
        List<SignatureResolver.SignerInfo> signers = List.of(
                new SignatureResolver.SignerInfo("president", "Anna", "Rossi", null, null, signaturePng()),
                new SignatureResolver.SignerInfo("treasurer", "Elena", "Neri", null, null, null));

        byte[] english = service.renderPdf(cert, template, signers, Locale.ENGLISH);
        assertThat(text(english)).contains("Attestato di partecipazione", "No. CERT-2026-0001", "May 4, 2026",
                "Niccolò D'Amato", "Grazie!", "Anna Rossi", "President", "Elena Neri", "Treasurer");
        assertThat(imageCount(english)).isEqualTo(2); // signature + QR code

        String french = text(service.renderPdf(cert, template, signers, Locale.FRENCH));
        assertThat(french).contains("N° CERT-2026-0001", "Président(e)", "Trésorier(ère)");
    }

    @Test
    void sanitizerKeepsWinAnsiAndNeverBreaksPdfGeneration() throws Exception {
        String hostile = "“Zoë” O’Brien – ½ 😀👨‍👩‍👧 Łukasz Dvořák 日本 €\tfine​";
        String safe = PdfText.sanitize(hostile);
        assertThat(safe).contains("“Zoë” O’Brien – ½", "€", "Lukasz", "Dvorák", "??", " fine").doesNotContain("😀", "\t", " ", "​");
        PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        assertThatCode(() -> font.encode(safe)).doesNotThrowAnyException();
        assertThat(PdfText.sanitize(null)).isEmpty();

        Member member = member();
        member.setFirstName("😀 “Zoë”");
        member.setLastName("Łukasz\nO’Brien");
        for (Locale locale : Messages.SUPPORTED_LOCALES) {
            String card = text(reports.generateMembershipCard(member, association(), locale));
            assertThat(card).contains("“Zoë” Lukasz O’Brien");
        }
    }

    @Test
    void moneyAndDatesFollowLocale() {
        BigDecimal amount = new BigDecimal("1234.5");
        assertThat(PdfText.sanitize(PdfText.money(amount, Locale.ITALIAN))).isEqualTo("1.234,50 €");
        assertThat(PdfText.sanitize(PdfText.money(amount, Locale.ENGLISH))).isEqualTo("€1,234.50");
        assertThat(PdfText.sanitize(PdfText.money(amount, Locale.FRENCH))).isEqualTo("1 234,50 €");
        assertThat(PdfText.date(LocalDate.of(2026, 4, 20), Locale.GERMAN)).isEqualTo("20.04.2026");
        assertThat(PdfText.date(LocalDate.of(2026, 4, 20), SPANISH)).contains("2026");
    }

    // --- fixtures ---

    private byte[] minutes(Locale locale, List<SignatureResolver.SignerInfo> signers) throws Exception {
        Assembly assembly = new Assembly();
        assembly.setId(1L);
        assembly.setTitle("Assemblea ordinaria");
        assembly.setType("ORDINARY");
        assembly.setDate(LocalDateTime.of(2026, 4, 20, 18, 0));
        assembly.setPresident("Anna Rossi");
        assembly.setSecretary("Luca Verdi");
        assembly.setFirstCallQuorum(50.0);
        assembly.setQuorumReached(true);

        List<AssemblyParticipant> participants = List.of(
                participant(11L, "PRESENT", null), participant(12L, "PRESENT", null),
                participant(13L, "PROXY", 11L), participant(14L, "ABSENT", null));
        Map<Long, String> names = Map.of(11L, "Giulia Bianchi", 12L, "Marco Neri", 13L, "Paolo Gallo", 14L, "Assente Tizio");

        List<AssemblyMotion> motions = List.of(
                motion(2, "Modifica statuto", "QUALIFIED", 5, 4, 0),
                motion(1, "Approvazione bilancio", "SIMPLE", 10, 2, 1),
                motion(3, "Proposta gite", "CONSULTATIVE", 0, 0, 0),
                motion(4, "Varie ed eventuali", "SIMPLE", null, null, null));
        return reports.generateAssemblyMinutes(assembly, participants, names, motions, signers, association(), locale);
    }

    private static AssemblyParticipant participant(Long userAssociationId, String type, Long proxyReceiverId) {
        AssemblyParticipant participant = new AssemblyParticipant();
        participant.setUserAssociationId(userAssociationId);
        participant.setParticipationType(type);
        participant.setProxyReceiverId(proxyReceiverId);
        return participant;
    }

    private static AssemblyMotion motion(int order, String title, String votingType, Integer favor, Integer against, Integer abstain) {
        AssemblyMotion motion = new AssemblyMotion();
        motion.setOrderNumber(order);
        motion.setTitle(title);
        motion.setVotingType(votingType);
        if (favor != null) {
            motion.setVotesInFavor(favor);
            motion.setVotesAgainst(against);
            motion.setVotesAbstain(abstain);
            motion.setDecisionTaken(AssemblyMotion.computeOutcome(votingType, favor, against, abstain));
        }
        return motion;
    }

    private static Member member() {
        Member member = new Member();
        member.setFirstName("Niccolò");
        member.setLastName("D'Amato");
        member.setFiscalCode("DMTNCL90A01H501X");
        member.setBirthDate(LocalDate.of(1990, 1, 1));
        member.setMembershipStatus("ACTIVE");
        return member;
    }

    private static Association association() {
        Association association = new Association();
        association.setId(1L);
        association.setName("Associazione Più Insieme");
        association.setAddress("Via Roma 1");
        association.setCity("Roma");
        association.setTaxCode("12345678901");
        association.setEmail("info@example.invalid");
        return association;
    }

    static byte[] signaturePng() throws Exception {
        BufferedImage image = new BufferedImage(240, 80, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.BLUE);
        g.drawLine(10, 60, 230, 20);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    private static String text(byte[] pdf) throws Exception {
        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
        try (PDDocument document = Loader.loadPDF(pdf)) {
            return new PDFTextStripper().getText(document).replaceAll("\\s+", " ");
        }
    }

    private static int imageCount(byte[] pdf) throws Exception {
        int count = 0;
        try (PDDocument document = Loader.loadPDF(pdf)) {
            for (PDPage page : document.getPages()) {
                PDResources resources = page.getResources();
                for (COSName name : resources.getXObjectNames()) {
                    if (resources.isImageXObject(name)) count++;
                }
            }
        }
        return count;
    }
}
