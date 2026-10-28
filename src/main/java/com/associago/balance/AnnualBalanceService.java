package com.associago.balance;

import com.associago.association.Association;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.finance.repository.TransactionRepository;
import com.associago.shared.SignatureResolver;
import com.associago.shared.i18n.Messages;
import com.associago.shared.pdf.PdfDocument;
import com.associago.shared.pdf.PdfText;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnnualBalanceService {

    private final AnnualBalanceRepository balanceRepository;
    private final AnnualBalanceLineRepository lineRepository;
    private final TransactionRepository transactionRepository;
    private final Messages messages;

    public AnnualBalanceService(AnnualBalanceRepository balanceRepository,
                                AnnualBalanceLineRepository lineRepository,
                                TransactionRepository transactionRepository,
                                Messages messages) {
        this.balanceRepository = balanceRepository;
        this.lineRepository = lineRepository;
        this.transactionRepository = transactionRepository;
        this.messages = messages;
    }

    public List<AnnualBalance> findByAssociation(Long associationId) {
        return balanceRepository.findByAssociationIdOrderByYearDesc(associationId);
    }

    public AnnualBalance findById(Long id) {
        return balanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annual balance not found: " + id));
    }

    public List<AnnualBalanceLine> getLines(Long balanceId) {
        return lineRepository.findByBalanceIdOrderBySortOrder(balanceId);
    }

    /**
     * Computes the annual balance automatically from registered transactions.
     * Groups transactions by category, computes totals, and generates balance lines.
     */
    @Transactional
    public AnnualBalance compute(Long associationId, Integer year) {
        AnnualBalance balance = balanceRepository.findByAssociationIdAndYear(associationId, year)
                .orElse(new AnnualBalance());

        balance.setAssociationId(associationId);
        balance.setYear(year);
        balance.setTitle(messages.get("balance.title", String.valueOf(year)));
        balance.setStatus("COMPUTED");
        balance.setComputedAt(LocalDateTime.now());
        balance.setUpdatedAt(LocalDateTime.now());

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<Transaction> transactions = transactionRepository
                .findByAssociationIdAndDateBetween(associationId, startDate, endDate);

        // Group by category and type
        Map<String, List<Transaction>> incomeByCategory = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .collect(Collectors.groupingBy(t -> t.getCategory() != null ? t.getCategory() : messages.get("balance.otherIncome")));

        Map<String, List<Transaction>> expenseByCategory = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(t -> t.getCategory() != null ? t.getCategory() : messages.get("balance.otherExpenses")));

        // Save balance first to get ID
        balance = balanceRepository.save(balance);

        // Delete old lines if recomputing
        lineRepository.deleteByBalanceId(balance.getId());

        List<AnnualBalanceLine> lines = new ArrayList<>();
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        int sortOrder = 0;

        // Previous year data for variance
        BigDecimal prevTotalIncome = transactionRepository.sumByTypeAndDateRange(
                TransactionType.INCOME, startDate.minusYears(1), endDate.minusYears(1));
        BigDecimal prevTotalExpenses = transactionRepository.sumByTypeAndDateRange(
                TransactionType.EXPENSE, startDate.minusYears(1), endDate.minusYears(1));
        if (prevTotalIncome == null) prevTotalIncome = BigDecimal.ZERO;
        if (prevTotalExpenses == null) prevTotalExpenses = BigDecimal.ZERO;

        // Income lines
        for (Map.Entry<String, List<Transaction>> entry : incomeByCategory.entrySet()) {
            BigDecimal amount = entry.getValue().stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalIncome = totalIncome.add(amount);

            AnnualBalanceLine line = new AnnualBalanceLine();
            line.setBalanceId(balance.getId());
            line.setSection("INCOME");
            line.setLabel(entry.getKey());
            line.setAmount(amount);
            line.setSortOrder(sortOrder++);
            lines.add(line);
        }

        // Income subtotal
        AnnualBalanceLine incomeSubtotal = new AnnualBalanceLine();
        incomeSubtotal.setBalanceId(balance.getId());
        incomeSubtotal.setSection("INCOME");
        incomeSubtotal.setLabel(messages.get("financial.totalIncome").toUpperCase(messages.current()));
        incomeSubtotal.setAmount(totalIncome);
        incomeSubtotal.setPreviousYearAmount(prevTotalIncome);
        incomeSubtotal.setVariance(totalIncome.subtract(prevTotalIncome));
        if (prevTotalIncome.compareTo(BigDecimal.ZERO) != 0) {
            incomeSubtotal.setVariancePct(totalIncome.subtract(prevTotalIncome)
                    .divide(prevTotalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        }
        incomeSubtotal.setSubtotal(true);
        incomeSubtotal.setSortOrder(sortOrder++);
        lines.add(incomeSubtotal);

        // Expense lines
        for (Map.Entry<String, List<Transaction>> entry : expenseByCategory.entrySet()) {
            BigDecimal amount = entry.getValue().stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalExpenses = totalExpenses.add(amount);

            AnnualBalanceLine line = new AnnualBalanceLine();
            line.setBalanceId(balance.getId());
            line.setSection("EXPENSE");
            line.setLabel(entry.getKey());
            line.setAmount(amount);
            line.setSortOrder(sortOrder++);
            lines.add(line);
        }

        // Expense subtotal
        AnnualBalanceLine expenseSubtotal = new AnnualBalanceLine();
        expenseSubtotal.setBalanceId(balance.getId());
        expenseSubtotal.setSection("EXPENSE");
        expenseSubtotal.setLabel(messages.get("financial.totalExpenses").toUpperCase(messages.current()));
        expenseSubtotal.setAmount(totalExpenses);
        expenseSubtotal.setPreviousYearAmount(prevTotalExpenses);
        expenseSubtotal.setVariance(totalExpenses.subtract(prevTotalExpenses));
        if (prevTotalExpenses.compareTo(BigDecimal.ZERO) != 0) {
            expenseSubtotal.setVariancePct(totalExpenses.subtract(prevTotalExpenses)
                    .divide(prevTotalExpenses, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        }
        expenseSubtotal.setSubtotal(true);
        expenseSubtotal.setSortOrder(sortOrder++);
        lines.add(expenseSubtotal);

        lineRepository.saveAll(lines);

        BigDecimal netResult = totalIncome.subtract(totalExpenses);
        balance.setTotalIncome(totalIncome);
        balance.setTotalExpenses(totalExpenses);
        balance.setNetResult(netResult);
        balance.setClosingFund(balance.getOpeningFund().add(netResult));

        return balanceRepository.save(balance);
    }

    @Transactional
    public AnnualBalance approve(Long id, Long approvedBy, String signatories) {
        AnnualBalance balance = findById(id);
        balance.setStatus("APPROVED");
        balance.setApprovedBy(approvedBy);
        balance.setApprovedAt(LocalDateTime.now());
        balance.setSignatories(signatories);
        balance.setUpdatedAt(LocalDateTime.now());
        return balanceRepository.save(balance);
    }

    @Transactional
    public void delete(Long id) {
        balanceRepository.deleteById(id);
    }

    /**
     * Genera il PDF A4 del bilancio consuntivo nella lingua richiesta, con firme (immagine sopra
     * nome e carica) e checksum SHA-256.
     */
    public byte[] generatePdf(AnnualBalance balance, List<AnnualBalanceLine> lines, Association association,
                              List<SignatureResolver.SignerInfo> signers, Locale locale) throws IOException {
        int year = balance.getYear() == null ? LocalDate.now().getYear() : balance.getYear();
        byte[] pdfBytes;
        try (PdfDocument pdf = new PdfDocument(PDRectangle.A4, null)) {
            float top = pdf.y();
            pdf.text(pdf.left(), top - 16, association.getName() != null ? association.getName()
                    : messages.get(locale, "pdf.associationFallback"), pdf.bold, 16);
            List<String> address = new ArrayList<>();
            if (association.getAddress() != null) address.add(association.getAddress());
            if (association.getCity() != null) address.add(association.getCity());
            String addressLine = String.join(", ", address);
            if (association.getTaxCode() != null) {
                addressLine += (addressLine.isEmpty() ? "" : " - ") + messages.get(locale, "pdf.taxCode", association.getTaxCode());
            }
            pdf.text(pdf.left(), top - 31, addressLine, pdf.regular, 10);
            pdf.hLine(pdf.left(), pdf.right(), top - 42, Color.GRAY);
            pdf.moveTo(top - 50);

            pdf.heading(messages.get(locale, "balance.title", String.valueOf(year)).toUpperCase(locale), 14);
            pdf.line(messages.get(locale, "balance.period", PdfText.date(LocalDate.of(year, 1, 1), locale),
                    PdfText.date(LocalDate.of(year, 12, 31), locale)), pdf.regular, 10);
            pdf.space(10);

            section(pdf, lines, "INCOME", messages.get(locale, "balance.income"),
                    messages.get(locale, "financial.totalIncome"), locale);
            pdf.space(8);
            section(pdf, lines, "EXPENSE", messages.get(locale, "balance.expenses"),
                    messages.get(locale, "financial.totalExpenses"), locale);

            pdf.space(6);
            pdf.rule();
            BigDecimal net = balance.getNetResult() == null ? BigDecimal.ZERO : balance.getNetResult();
            amountRow(pdf, messages.get(locale, net.signum() >= 0 ? "balance.surplus" : "balance.deficit").toUpperCase(locale),
                    net, pdf.bold, 12, locale);
            if (balance.getOpeningFund() != null && balance.getClosingFund() != null) {
                amountRow(pdf, messages.get(locale, "balance.openingFund"), balance.getOpeningFund(), pdf.regular, 10, locale);
                amountRow(pdf, messages.get(locale, "balance.closingFund"), balance.getClosingFund(), pdf.regular, 10, locale);
            }

            pdf.space(30);
            List<PdfDocument.SignatureBlock> blocks = (signers == null ? List.<SignatureResolver.SignerInfo>of() : signers).stream()
                    .map(signer -> signer.toBlock(messages, locale))
                    .toList();
            pdf.signatures(messages.get(locale, "pdf.signatures"), blocks);

            String generated = messages.get(locale, "pdf.generatedOn", PdfText.dateTime(LocalDateTime.now(), locale));
            String disclaimer = messages.get(locale, "pdf.disclaimer");
            pdfBytes = pdf.finish((doc, page, count) -> {
                doc.text(doc.left(), 50, disclaimer, doc.italic, 7, PdfDocument.MUTED);
                doc.text(doc.left(), 38, generated, doc.regular, 7, PdfDocument.MUTED);
                doc.textRight(doc.right(), 38, messages.get(locale, "pdf.page", page, count), doc.regular, 7);
            });
        }

        balance.setChecksum(computeChecksum(pdfBytes));
        balanceRepository.save(balance);
        return pdfBytes;
    }

    private void section(PdfDocument pdf, List<AnnualBalanceLine> lines, String section, String title,
                         String totalLabel, Locale locale) throws IOException {
        pdf.heading(title.toUpperCase(locale), 12);
        for (AnnualBalanceLine line : lines) {
            if (!section.equals(line.getSection())) continue;
            // Subtotal labels are stored in the language used when computing: show them in the PDF language.
            String label = line.isSubtotal() ? totalLabel.toUpperCase(locale) : line.getLabel();
            amountRow(pdf, label, line.getAmount(), line.isSubtotal() ? pdf.bold : pdf.regular, 10, locale);
        }
    }

    private void amountRow(PdfDocument pdf, String label, BigDecimal amount, PDFont font, float size, Locale locale) throws IOException {
        pdf.row(new float[]{pdf.left() + 10, pdf.right() - 130}, new String[]{label, PdfText.money(amount, locale)},
                new boolean[]{false, true}, font, size);
    }

    private String computeChecksum(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
