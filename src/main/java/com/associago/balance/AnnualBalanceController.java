package com.associago.balance;

import com.associago.association.AssociationService;
import com.associago.balance.dto.AnnualBalanceDTO;
import com.associago.balance.dto.AnnualBalanceLineDTO;
import com.associago.balance.mapper.AnnualBalanceMapper;
import com.associago.shared.SignatureResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/balances")
public class AnnualBalanceController {

    private final AnnualBalanceService balanceService;
    private final AssociationService associationService;
    private final SignatureResolver signatureResolver;

    public AnnualBalanceController(AnnualBalanceService balanceService,
                                   AssociationService associationService,
                                   SignatureResolver signatureResolver) {
        this.balanceService = balanceService;
        this.associationService = associationService;
        this.signatureResolver = signatureResolver;
    }

    @GetMapping
    public List<AnnualBalanceDTO> getAll(@RequestParam Long associationId) {
        return balanceService.findByAssociation(associationId).stream()
                .map(AnnualBalanceMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public AnnualBalanceDTO getById(@PathVariable Long id) {
        return AnnualBalanceMapper.toDTO(balanceService.findById(id));
    }

    @GetMapping("/{id}/lines")
    public List<AnnualBalanceLineDTO> getLines(@PathVariable Long id) {
        return balanceService.getLines(id).stream()
                .map(AnnualBalanceMapper::toDTO)
                .toList();
    }

    @PostMapping("/compute")
    public AnnualBalanceDTO compute(@RequestParam Long associationId, @RequestParam Integer year) {
        return AnnualBalanceMapper.toDTO(balanceService.compute(associationId, year));
    }

    @PostMapping("/{id}/approve")
    public AnnualBalanceDTO approve(@PathVariable Long id,
                                 @RequestParam Long approvedBy,
                                 @RequestBody(required = false) String signatories) {
        return AnnualBalanceMapper.toDTO(balanceService.approve(id, approvedBy, signatories));
    }

    @GetMapping("/{id}/check-signers")
    public ResponseEntity<List<String>> checkMissingSigners(@PathVariable Long id) {
        AnnualBalance balance = balanceService.findById(id);
        List<String> missing = signatureResolver.getMissingSigners(
                balance.getAssociationId(), List.of("president", "secretary", "treasurer"));
        return ResponseEntity.ok(missing);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) throws IOException {
        AnnualBalance balance = balanceService.findById(id);
        List<AnnualBalanceLine> lines = balanceService.getLines(id);
        var association = associationService.findById(balance.getAssociationId())
                .orElseThrow(() -> new RuntimeException("Association not found"));
        var signers = signatureResolver.resolveSigners(
                balance.getAssociationId(), List.of("president", "secretary", "treasurer"));

        byte[] pdf = balanceService.generatePdf(balance, lines, association, signers);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=bilancio_" + balance.getYear() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        balanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
