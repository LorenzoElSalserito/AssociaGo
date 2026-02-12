package com.associago.report;

import com.associago.assembly.Assembly;
import com.associago.assembly.AssemblyMotion;
import com.associago.assembly.AssemblyParticipant;
import com.associago.finance.Transaction;
import com.associago.member.Member;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
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

    public byte[] generateMembershipCard(Member member) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("AssociaGo - Tessera Associativa");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("Nome: " + member.getFirstName() + " " + member.getLastName());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Codice Fiscale: " + (member.getFiscalCode() != null ? member.getFiscalCode() : "N/D"));
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Stato: " + member.getMembershipStatus());
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateTransactionReceipt(Transaction transaction, Member member) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("Ricevuta di Pagamento");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("Data: " + transaction.getDate().format(DATE_FORMATTER));
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Descrizione: " + transaction.getDescription());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Importo: " + transaction.getAmount() + " EUR");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Metodo: " + transaction.getPaymentMethod());
                
                if (member != null) {
                    contentStream.newLineAtOffset(0, -30);
                    contentStream.showText("Intestato a: " + member.getFirstName() + " " + member.getLastName());
                    contentStream.newLineAtOffset(0, -20);
                    contentStream.showText("C.F.: " + member.getFiscalCode());
                }
                
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateFinancialReport(int year, Map<String, BigDecimal> summary, List<Transaction> transactions) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("Bilancio Finanziario " + year);
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("Entrate Totali: " + summary.getOrDefault("incomeCurrent", BigDecimal.ZERO) + " EUR");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Uscite Totali: " + summary.getOrDefault("expenseCurrent", BigDecimal.ZERO) + " EUR");
                contentStream.endText();
                
                // Note: A full list of transactions would require pagination logic which is omitted for brevity in this MVP step.
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 10);
                contentStream.newLineAtOffset(50, 650);
                contentStream.showText("(Dettaglio transazioni omesso per brevità in questa versione)");
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateAssemblyMinutes(Assembly assembly, List<AssemblyParticipant> participants, List<AssemblyMotion> motions) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Header
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("Verbale di Assemblea");
                contentStream.endText();

                // Details
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 720);
                contentStream.showText("Titolo: " + assembly.getTitle());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Data: " + assembly.getDate().format(DATE_TIME_FORMATTER));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Luogo: " + assembly.getLocation());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Presidente: " + (assembly.getPresident() != null ? assembly.getPresident() : "N/D"));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Segretario: " + (assembly.getSecretary() != null ? assembly.getSecretary() : "N/D"));
                contentStream.endText();

                // Participants Summary
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.newLineAtOffset(50, 630);
                contentStream.showText("Partecipanti");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 610);
                long present = participants.stream().filter(p -> "PRESENT".equals(p.getParticipationType())).count();
                long proxy = participants.stream().filter(p -> "PROXY".equals(p.getParticipationType())).count();
                contentStream.showText("Presenti: " + present + " - Deleghe: " + proxy);
                contentStream.endText();

                // Motions
                int yOffset = 580;
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.newLineAtOffset(50, yOffset);
                contentStream.showText("Mozioni e Votazioni");
                contentStream.endText();
                yOffset -= 20;

                for (AssemblyMotion motion : motions) {
                    if (yOffset < 100) { // Simple check to avoid writing off page
                        break; 
                    }
                    
                    contentStream.beginText();
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                    contentStream.newLineAtOffset(50, yOffset);
                    contentStream.showText("- " + motion.getTitle());
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

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
}
