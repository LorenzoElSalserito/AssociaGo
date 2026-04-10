package com.associago.report;

import com.associago.activity.Activity;
import com.associago.activity.ActivityService;
import com.associago.assembly.Assembly;
import com.associago.assembly.AssemblyService;
import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.event.Event;
import com.associago.event.EventService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;
    private final MemberService memberService;
    private final FinancialService financialService;
    private final AssemblyService assemblyService;
    private final AssociationService associationService;
    private final ActivityService activityService;
    private final EventService eventService;

    public ReportController(ReportService reportService, MemberService memberService,
                            FinancialService financialService, AssemblyService assemblyService,
                            AssociationService associationService, ActivityService activityService,
                            EventService eventService) {
        this.reportService = reportService;
        this.memberService = memberService;
        this.financialService = financialService;
        this.assemblyService = assemblyService;
        this.associationService = associationService;
        this.activityService = activityService;
        this.eventService = eventService;
    }

    private Association getAssociation(Long associationId) {
        return associationService.findById(associationId).orElse(new Association());
    }

    @GetMapping("/members/{id}/card")
    public ResponseEntity<byte[]> getMembershipCard(@PathVariable Long id, @RequestHeader(value = "X-Association-Id", required = false) Long associationId) throws IOException {
        Member member = memberService.getMemberById(id).orElseThrow(() -> new RuntimeException("Member not found"));
        Association association = getAssociation(associationId != null ? associationId : 1L); // Fallback to 1 for now
        
        byte[] pdf = reportService.generateMembershipCard(member, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tessera_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/finance/transactions/{id}/receipt")
    public ResponseEntity<byte[]> getTransactionReceipt(@PathVariable Long id, @RequestHeader(value = "X-Association-Id", required = false) Long associationId) throws IOException {
        Transaction transaction = financialService.getTransactionById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
        Member member = null;
        if (transaction.getUserId() != null) {
            member = memberService.getMemberById(transaction.getUserId()).orElse(null);
        }
        Association association = getAssociation(associationId != null ? associationId : transaction.getAssociationId());

        byte[] pdf = reportService.generateTransactionReceipt(transaction, member, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ricevuta_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/finance/year/{year}")
    public ResponseEntity<byte[]> getFinancialReport(@PathVariable int year, @RequestHeader(value = "X-Association-Id", required = false) Long associationId) throws IOException {
        Map<String, BigDecimal> summary = financialService.getYearOverYearComparison(year);
        List<Transaction> transactions = financialService.getAllTransactions(); // Should be filtered by year ideally
        Association association = getAssociation(associationId != null ? associationId : 1L);

        byte[] pdf = reportService.generateFinancialReport(year, summary, transactions, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bilancio_" + year + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/finance/comparison")
    public ResponseEntity<byte[]> getComparisonReport(
            @RequestParam int year1,
            @RequestParam int year2,
            @RequestHeader(value = "X-Association-Id", required = false) Long associationId
    ) throws IOException {
        Map<String, BigDecimal> summary = financialService.getCustomComparison(year1, year2);
        Association association = getAssociation(associationId != null ? associationId : 1L);

        byte[] pdf = reportService.generateComparisonReport(year1, year2, summary, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=confronto_" + year1 + "_" + year2 + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/members/list")
    public ResponseEntity<byte[]> getMemberList(@RequestHeader(value = "X-Association-Id", required = false) Long associationId) throws IOException {
        List<Member> members = new ArrayList<>();
        memberService.getAllMembers().forEach(members::add);
        Association association = getAssociation(associationId != null ? associationId : 1L);

        byte[] pdf = reportService.generateMemberList(members, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=elenco_soci.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/events/{id}/report")
    public ResponseEntity<byte[]> getEventReport(@PathVariable Long id, @RequestHeader(value = "X-Association-Id", required = false) Long associationId) throws IOException {
        Event event = eventService.getEventById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        int participantCount = eventService.getParticipants(id).size();
        Association association = getAssociation(associationId != null ? associationId : event.getAssociationId());

        byte[] pdf = reportService.generateEventReport(event, participantCount, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report_evento_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/activities/{id}/report")
    public ResponseEntity<byte[]> getActivityReport(@PathVariable Long id, @RequestHeader(value = "X-Association-Id", required = false) Long associationId) throws IOException {
        Activity activity = activityService.findById(id).orElseThrow(() -> new RuntimeException("Activity not found"));
        int participantCount = activityService.findParticipantsByActivityId(id).size();
        Association association = getAssociation(associationId != null ? associationId : activity.getAssociationId());

        byte[] pdf = reportService.generateActivityReport(activity, participantCount, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report_attivita_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/assemblies/{id}/minutes")
    public ResponseEntity<byte[]> getAssemblyMinutes(@PathVariable Long id, @RequestHeader(value = "X-Association-Id", required = false) Long associationId) throws IOException {
        Assembly assembly = assemblyService.getAssemblyById(id).orElseThrow(() -> new RuntimeException("Assembly not found"));
        var participants = assemblyService.getParticipants(id);
        var motions = assemblyService.getMotions(id);
        Association association = getAssociation(associationId != null ? associationId : assembly.getAssociationId());

        byte[] pdf = reportService.generateAssemblyMinutes(assembly, participants, motions, association);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=verbale_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
