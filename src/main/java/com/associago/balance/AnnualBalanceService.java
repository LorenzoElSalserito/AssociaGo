package com.associago.balance;

import com.associago.association.Association;
import com.associago.finance.Transaction;
import com.associago.finance.TransactionType;
import com.associago.finance.repository.TransactionRepository;
import com.associago.shared.SignatureResolver;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnnualBalanceService {

    private final AnnualBalanceRepository balanceRepository;
    private final AnnualBalanceLineRepository lineRepository;
    private final TransactionRepository transactionRepository;

    public AnnualBalanceService(AnnualBalanceRepository balanceRepository,
                                AnnualBalanceLineRepository lineRepository,
                                TransactionRepository transactionRepository) {
        this.balanceRepository = balanceRepository;
        this.lineRepository = lineRepository;
        this.transactionRepository = transactionRepository;
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
        balance.setTitle("Bilancio Consuntivo " + year);
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
                .collect(Collectors.groupingBy(t -> t.getCategory() != null ? t.getCategory() : "Altre entrate"));

        Map<String, List<Transaction>> expenseByCategory = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(t -> t.getCategory() != null ? t.getCategory() : "Altre uscite"));

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
        incomeSubtotal.setLabel("TOTALE ENTRATE");
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
        expenseSubtotal.setLabel("TOTALE USCITE");
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
     * Genera il PDF del bilancio consuntivo con firme automatiche e checksum SHA-256.
     */
    public byte[] generatePdf(AnnualBalance balance, List<AnnualBalanceLine> lines,
                               Association association, List<SignatureResolver.SignerInfo> signers) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                PDType1Font italic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

                // Header
                cs.beginText();
                cs.setFont(bold, 16);
                cs.newLineAtOffset(50, 760);
                cs.showText(association.getName() != null ? association.getName() : "Associazione");
                cs.setFont(normal, 10);
                cs.newLineAtOffset(0, -15);
                String addr = "";
                if (association.getAddress() != null) addr += association.getAddress();
                if (association.getCity() != null) addr += ", " + association.getCity();
                if (association.getTaxCode() != null) addr += " - C.F. " + association.getTaxCode();
                cs.showText(addr);
                cs.endText();

                cs.moveTo(50, 735);
                cs.lineTo(550, 735);
                cs.stroke();

                // Title
                cs.beginText();
                cs.setFont(bold, 14);
                cs.newLineAtOffset(50, 710);
                cs.showText("BILANCIO CONSUNTIVO " + balance.getYear());
                cs.setFont(normal, 10);
                cs.newLineAtOffset(0, -15);
                cs.showText("Periodo: 01/01/" + balance.getYear() + " - 31/12/" + balance.getYear());
                cs.endText();

                int y = 675;

                // Income section
                cs.beginText();
                cs.setFont(bold, 12);
                cs.newLineAtOffset(50, y);
                cs.showText("ENTRATE");
                cs.endText();
                y -= 18;

                for (AnnualBalanceLine line : lines) {
                    if ("INCOME".equals(line.getSection())) {
                        cs.beginText();
                        cs.setFont(line.isSubtotal() ? bold : normal, 10);
                        cs.newLineAtOffset(60, y);
                        cs.showText(line.getLabel());
                        cs.newLineAtOffset(350, 0);
                        cs.showText(String.format("€ %,.2f", line.getAmount()));
                        cs.endText();
                        y -= 14;
                    }
                }

                y -= 10;

                // Expense section
                cs.beginText();
                cs.setFont(bold, 12);
                cs.newLineAtOffset(50, y);
                cs.showText("USCITE");
                cs.endText();
                y -= 18;

                for (AnnualBalanceLine line : lines) {
                    if ("EXPENSE".equals(line.getSection())) {
                        cs.beginText();
                        cs.setFont(line.isSubtotal() ? bold : normal, 10);
                        cs.newLineAtOffset(60, y);
                        cs.showText(line.getLabel());
                        cs.newLineAtOffset(350, 0);
                        cs.showText(String.format("€ %,.2f", line.getAmount()));
                        cs.endText();
                        y -= 14;
                    }
                }

                y -= 15;
                cs.moveTo(50, y);
                cs.lineTo(550, y);
                cs.stroke();
                y -= 18;

                // Net result
                cs.beginText();
                cs.setFont(bold, 12);
                cs.newLineAtOffset(60, y);
                String resultLabel = balance.getNetResult().compareTo(BigDecimal.ZERO) >= 0
                        ? "AVANZO DI GESTIONE" : "DISAVANZO DI GESTIONE";
                cs.showText(resultLabel);
                cs.newLineAtOffset(350, 0);
                cs.showText(String.format("€ %,.2f", balance.getNetResult()));
                cs.endText();
                y -= 30;

                // Signers
                cs.beginText();
                cs.setFont(bold, 10);
                cs.newLineAtOffset(50, y);
                cs.showText("Firme:");
                cs.endText();
                y -= 18;

                for (SignatureResolver.SignerInfo signer : signers) {
                    if (signer.firstName() != null) {
                        cs.beginText();
                        cs.setFont(normal, 10);
                        cs.newLineAtOffset(60, y);
                        cs.showText(signer.title() + ": " + signer.firstName() + " " + signer.lastName());
                        cs.endText();
                        y -= 14;
                    }
                }

                y -= 20;

                // Disclaimer (P11)
                cs.beginText();
                cs.setFont(italic, 7);
                cs.setNonStrokingColor(100, 100, 100);
                cs.newLineAtOffset(50, 50);
                cs.showText("AssociaGo può commettere errori, controllare sempre gli output prima di inoltrare i documenti.");
                cs.endText();

                // Generation timestamp
                cs.beginText();
                cs.setFont(normal, 7);
                cs.newLineAtOffset(50, 38);
                cs.showText("Generato il " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            byte[] pdfBytes = baos.toByteArray();

            // Compute checksum
            String checksum = computeChecksum(pdfBytes);
            balance.setChecksum(checksum);
            balanceRepository.save(balance);

            return pdfBytes;
        }
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
