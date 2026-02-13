package com.associago.report;

import com.associago.assembly.Assembly;
import com.associago.assembly.AssemblyMotion;
import com.associago.assembly.AssemblyParticipant;
import com.associago.association.Association;
import com.associago.finance.Transaction;
import com.associago.member.Member;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private void addHeader(PDDocument document, PDPage page, Association association) throws IOException {
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
            // Logo
            if (association.getLogo() != null && association.getLogo().length > 0) {
                try {
                    PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, association.getLogo(), "logo");
                    // Scale image to fit in 50x50 box
                    float scale = Math.min(50f / pdImage.getWidth(), 50f / pdImage.getHeight());
                    contentStream.drawImage(pdImage, 50, 730, pdImage.getWidth() * scale, pdImage.getHeight() * scale);
                } catch (Exception e) {
                    // Ignore image errors, just don't draw it
                }
            }

            // Association Name
            contentStream.beginText();
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
            contentStream.newLineAtOffset(110, 760); // Offset from logo
            contentStream.showText(association.getName() != null ? association.getName() : "Associazione");
            contentStream.endText();
            
            // Separator line
            contentStream.moveTo(50, 720);
            contentStream.lineTo(550, 720);
            contentStream.stroke();
        }
    }

    private void addFooter(PDDocument document, PDPage page, Association association) throws IOException {
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
            contentStream.beginText();
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
            contentStream.setNonStrokingColor(100, 100, 100); // Gray
            contentStream.newLineAtOffset(50, 30);
            
            String footerText = association.getName() != null ? association.getName() : "";
            if (association.getAddress() != null) footerText += " - " + association.getAddress();
            if (association.getCity() != null) footerText += ", " + association.getCity();
            if (association.getTaxCode() != null) footerText += " - C.F. " + association.getTaxCode();
            if (association.getVatNumber() != null) footerText += " - P.IVA " + association.getVatNumber();
            if (association.getEmail() != null) footerText += " - " + association.getEmail();

            contentStream.showText(footerText);
            contentStream.endText();
        }
    }

    private BigDecimal getSafeAmount(Map<String, BigDecimal> summary, String key) {
        if (summary == null) return BigDecimal.ZERO;
        BigDecimal value = summary.get(key);
        return value != null ? value : BigDecimal.ZERO;
    }

    public byte[] generateMembershipCard(Member member, Association association) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            addHeader(document, page, association);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("Tessera Associativa");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 600);
                contentStream.showText("Nome: " + member.getFirstName() + " " + member.getLastName());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Codice Fiscale: " + (member.getFiscalCode() != null ? member.getFiscalCode() : "N/D"));
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Stato: " + member.getMembershipStatus());
                contentStream.endText();
            }

            addFooter(document, page, association);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateTransactionReceipt(Transaction transaction, Member member, Association association) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            addHeader(document, page, association);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("Ricevuta di Pagamento");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 600);
                contentStream.showText("Data: " + transaction.getDate().format(DATE_FORMATTER));
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Descrizione: " + (transaction.getDescription() != null ? transaction.getDescription() : ""));
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Importo: " + transaction.getAmount() + " EUR");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Metodo: " + (transaction.getPaymentMethod() != null ? transaction.getPaymentMethod() : "N/D"));
                
                if (member != null) {
                    contentStream.newLineAtOffset(0, -30);
                    contentStream.showText("Intestato a: " + member.getFirstName() + " " + member.getLastName());
                    contentStream.newLineAtOffset(0, -20);
                    contentStream.showText("C.F.: " + (member.getFiscalCode() != null ? member.getFiscalCode() : "N/D"));
                }
                
                contentStream.endText();
            }

            addFooter(document, page, association);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateFinancialReport(int year, Map<String, BigDecimal> summary, List<Transaction> transactions, Association association) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            addHeader(document, page, association);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("Bilancio Finanziario " + year);
                contentStream.endText();

                BigDecimal income = getSafeAmount(summary, "incomeCurrent");
                BigDecimal expense = getSafeAmount(summary, "expenseCurrent");

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 600);
                contentStream.showText("Entrate Totali: " + income + " EUR");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Uscite Totali: " + expense + " EUR");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Saldo Netto: " + income.subtract(expense) + " EUR");
                contentStream.endText();
                
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 10);
                contentStream.newLineAtOffset(50, 530);
                contentStream.showText("(Dettaglio transazioni omesso per brevità in questa versione)");
                contentStream.endText();
            }

            addFooter(document, page, association);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateComparisonReport(int year1, int year2, Map<String, BigDecimal> summary, Association association) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            addHeader(document, page, association);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("Confronto Finanziario " + year1 + " vs " + year2);
                contentStream.endText();

                BigDecimal income1 = getSafeAmount(summary, "incomeYear1");
                BigDecimal expense1 = getSafeAmount(summary, "expenseYear1");
                BigDecimal income2 = getSafeAmount(summary, "incomeYear2");
                BigDecimal expense2 = getSafeAmount(summary, "expenseYear2");

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                contentStream.newLineAtOffset(50, 600);
                contentStream.showText("Anno " + year1);
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 580);
                contentStream.showText("Entrate: " + income1 + " EUR");
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Uscite: " + expense1 + " EUR");
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Saldo: " + income1.subtract(expense1) + " EUR");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                contentStream.newLineAtOffset(300, 600);
                contentStream.showText("Anno " + year2);
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(300, 580);
                contentStream.showText("Entrate: " + income2 + " EUR");
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Uscite: " + expense2 + " EUR");
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Saldo: " + income2.subtract(expense2) + " EUR");
                contentStream.endText();
            }

            addFooter(document, page, association);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateAssemblyMinutes(Assembly assembly, List<AssemblyParticipant> participants, List<AssemblyMotion> motions, Association association) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            addHeader(document, page, association);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                // Header
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("Verbale di Assemblea");
                contentStream.endText();

                // Details
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 620);
                contentStream.showText("Titolo: " + (assembly.getTitle() != null ? assembly.getTitle() : ""));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Data: " + (assembly.getDate() != null ? assembly.getDate().format(DATE_TIME_FORMATTER) : "N/D"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Luogo: " + (assembly.getLocation() != null ? assembly.getLocation() : "N/D"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Presidente: " + (assembly.getPresident() != null ? assembly.getPresident() : "N/D"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Segretario: " + (assembly.getSecretary() != null ? assembly.getSecretary() : "N/D"));
                contentStream.endText();

                // Participants Summary
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.newLineAtOffset(50, 530);
                contentStream.showText("Partecipanti");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 510);
                long present = participants != null ? participants.stream().filter(p -> "PRESENT".equals(p.getParticipationType())).count() : 0;
                long proxy = participants != null ? participants.stream().filter(p -> "PROXY".equals(p.getParticipationType())).count() : 0;
                contentStream.showText("Presenti: " + present + " - Deleghe: " + proxy);
                contentStream.endText();

                // Motions
                int yOffset = 480;
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.newLineAtOffset(50, yOffset);
                contentStream.showText("Mozioni e Votazioni");
                contentStream.endText();
                yOffset -= 20;

                if (motions != null) {
                    for (AssemblyMotion motion : motions) {
                        if (yOffset < 100) { // Simple check to avoid writing off page
                            break; 
                        }
                        
                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                        contentStream.newLineAtOffset(50, yOffset);
                        contentStream.showText("- " + (motion.getTitle() != null ? motion.getTitle() : ""));
                        contentStream.endText();
                        yOffset -= 15;

                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                        contentStream.newLineAtOffset(60, yOffset);
                        contentStream.showText("Esito: " + (motion.isApproved() ? "APPROVATA" : "RESPINTA"));
                        contentStream.endText();
                        yOffset -= 20;
                    }
                }
            }

            addFooter(document, page, association);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
}
