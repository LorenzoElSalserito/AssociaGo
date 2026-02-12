package com.associago.report;

import com.associago.assembly.Assembly;
import com.associago.assembly.AssemblyService;
import com.associago.finance.FinancialService;
import com.associago.finance.Transaction;
import com.associago.member.Member;
import com.associago.member.MemberService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;
    private final MemberService memberService;
    private final FinancialService financialService;
    private final AssemblyService assemblyService;

    public ReportController(ReportService reportService, MemberService memberService, FinancialService financialService, AssemblyService assemblyService) {
        this.reportService = reportService;
        this.memberService = memberService;
        this.financialService = financialService;
        this.assemblyService = assemblyService;
    }

    @GetMapping("/members/{id}/card")
    public ResponseEntity<byte[]> getMembershipCard(@PathVariable Long id) throws IOException {
        Member member = memberService.getMemberById(id).orElseThrow(() -> new RuntimeException("Member not found"));
        byte[] pdf = reportService.generateMembershipCard(member);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tessera_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/finance/transactions/{id}/receipt")
    public ResponseEntity<byte[]> getTransactionReceipt(@PathVariable Long id) throws IOException {
        Transaction transaction = financialService.getTransactionById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
        Member member = null;
        if (transaction.getUserId() != null) {
            member = memberService.getMemberById(transaction.getUserId()).orElse(null);
        }
        
        byte[] pdf = reportService.generateTransactionReceipt(transaction, member);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ricevuta_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/finance/year/{year}")
    public ResponseEntity<byte[]> getFinancialReport(@PathVariable int year) throws IOException {
        Map<String, BigDecimal> summary = financialService.getYearOverYearComparison(year);
        List<Transaction> transactions = financialService.getAllTransactions(); // Should be filtered by year ideally
        
        byte[] pdf = reportService.generateFinancialReport(year, summary, transactions);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bilancio_" + year + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/assemblies/{id}/minutes")
    public ResponseEntity<byte[]> getAssemblyMinutes(@PathVariable Long id) throws IOException {
        Assembly assembly = assemblyService.getAssemblyById(id).orElseThrow(() -> new RuntimeException("Assembly not found"));
        var participants = assemblyService.getParticipants(id);
        var motions = assemblyService.getMotions(id);
        
        byte[] pdf = reportService.generateAssemblyMinutes(assembly, participants, motions);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=verbale_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
