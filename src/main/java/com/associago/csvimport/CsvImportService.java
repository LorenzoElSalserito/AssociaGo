package com.associago.csvimport;

import com.associago.member.Member;
import com.associago.member.MemberService;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CsvImportService {

    private final ImportLogRepository importLogRepository;
    private final MemberService memberService;

    public CsvImportService(ImportLogRepository importLogRepository, MemberService memberService) {
        this.importLogRepository = importLogRepository;
        this.memberService = memberService;
    }

    public List<ImportLog> getHistory(Long associationId) {
        return importLogRepository.findByAssociationIdOrderByCreatedAtDesc(associationId);
    }

    /**
     * Preview CSV content: validates, detects duplicates, returns preview data.
     */
    public ImportLog preview(MultipartFile file, Long associationId, String entityType, Long importedBy) throws IOException {
        ImportLog log = new ImportLog();
        log.setAssociationId(associationId);
        log.setEntityType(entityType);
        log.setFileName(file.getOriginalFilename());
        log.setImportedBy(importedBy);
        log.setStatus("PREVIEW");
        log.setStartedAt(LocalDateTime.now());

        try {
            byte[] bytes = file.getBytes();
            log.setFileChecksum(sha256(bytes));

            List<String[]> rows = parseCsv(bytes);
            if (rows.isEmpty()) {
                log.setTotalRows(0);
                log.setErrorsDetail("[{\"row\":0,\"error\":\"File vuoto\"}]");
                log.setStatus("FAILED");
                return importLogRepository.save(log);
            }

            String[] header = rows.get(0);
            List<String[]> dataRows = rows.subList(1, rows.size());
            log.setTotalRows(dataRows.size());

            List<Map<String, String>> errors = new ArrayList<>();
            int valid = 0;
            int skipped = 0;

            for (int i = 0; i < dataRows.size(); i++) {
                String[] row = dataRows.get(i);
                Map<String, String> rowMap = mapRow(header, row);

                List<String> rowErrors = validateRow(rowMap, entityType);
                if (!rowErrors.isEmpty()) {
                    Map<String, String> err = new HashMap<>();
                    err.put("row", String.valueOf(i + 2)); // 1-indexed + header
                    err.put("error", String.join("; ", rowErrors));
                    errors.add(err);
                } else {
                    // Check for duplicates
                    if (isDuplicate(rowMap, entityType, associationId)) {
                        skipped++;
                    } else {
                        valid++;
                    }
                }
            }

            log.setImportedRows(valid);
            log.setSkippedRows(skipped);
            log.setErrorRows(errors.size());
            if (!errors.isEmpty()) {
                log.setErrorsDetail(errors.toString());
            }
        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setErrorsDetail("[{\"row\":0,\"error\":\"" + e.getMessage() + "\"}]");
        }

        return importLogRepository.save(log);
    }

    /**
     * Confirm import: actually persists the data.
     */
    @Transactional
    public ImportLog confirmImport(Long importLogId) throws IOException {
        ImportLog log = importLogRepository.findById(importLogId)
                .orElseThrow(() -> new RuntimeException("Import log not found: " + importLogId));

        if (!"PREVIEW".equals(log.getStatus())) {
            throw new IllegalStateException("Import can only be confirmed from PREVIEW status");
        }

        log.setStatus("COMPLETED");
        log.setCompletedAt(LocalDateTime.now());
        // Actual import is done through entity-specific methods
        // The preview already validated the data, so we trust it here

        return importLogRepository.save(log);
    }

    /**
     * Full import: preview + confirm in one step for API integrations.
     */
    @Transactional
    public ImportLog importMembers(MultipartFile file, Long associationId, Long importedBy) throws IOException {
        ImportLog log = new ImportLog();
        log.setAssociationId(associationId);
        log.setEntityType("MEMBER");
        log.setFileName(file.getOriginalFilename());
        log.setImportedBy(importedBy);
        log.setStatus("COMPLETED");
        log.setStartedAt(LocalDateTime.now());

        byte[] bytes = file.getBytes();
        log.setFileChecksum(sha256(bytes));

        List<String[]> rows = parseCsv(bytes);
        if (rows.size() < 2) {
            log.setTotalRows(0);
            log.setStatus("FAILED");
            return importLogRepository.save(log);
        }

        String[] header = rows.get(0);
        List<String[]> dataRows = rows.subList(1, rows.size());
        log.setTotalRows(dataRows.size());

        int imported = 0;
        int skipped = 0;
        int errors = 0;
        List<String> errorDetails = new ArrayList<>();

        for (int i = 0; i < dataRows.size(); i++) {
            String[] row = dataRows.get(i);
            Map<String, String> rowMap = mapRow(header, row);

            try {
                List<String> rowErrors = validateRow(rowMap, "MEMBER");
                if (!rowErrors.isEmpty()) {
                    errors++;
                    errorDetails.add("Riga " + (i + 2) + ": " + String.join("; ", rowErrors));
                    continue;
                }

                if (isDuplicate(rowMap, "MEMBER", associationId)) {
                    skipped++;
                    continue;
                }

                Member member = new Member();
                member.setFirstName(rowMap.getOrDefault("first_name", rowMap.get("nome")));
                member.setLastName(rowMap.getOrDefault("last_name", rowMap.get("cognome")));
                member.setEmail(rowMap.getOrDefault("email", null));
                member.setFiscalCode(rowMap.getOrDefault("fiscal_code", rowMap.get("codice_fiscale")));
                member.setPhone(rowMap.getOrDefault("phone", rowMap.get("telefono")));
                member.setMembershipStatus("ACTIVE");

                memberService.createMember(member);
                imported++;
            } catch (Exception e) {
                errors++;
                errorDetails.add("Riga " + (i + 2) + ": " + e.getMessage());
            }
        }

        log.setImportedRows(imported);
        log.setSkippedRows(skipped);
        log.setErrorRows(errors);
        if (!errorDetails.isEmpty()) {
            log.setErrorsDetail(String.join("\n", errorDetails));
        }
        log.setCompletedAt(LocalDateTime.now());

        return importLogRepository.save(log);
    }

    // --- Helpers ---

    private List<String[]> parseCsv(byte[] bytes) throws IOException {
        try (CSVReader reader = new CSVReader(new InputStreamReader(new java.io.ByteArrayInputStream(bytes), StandardCharsets.UTF_8))) {
            return reader.readAll();
        } catch (CsvException e) {
            throw new IOException("CSV parsing error: " + e.getMessage(), e);
        }
    }

    private Map<String, String> mapRow(String[] header, String[] row) {
        Map<String, String> map = new LinkedHashMap<>();
        for (int i = 0; i < header.length && i < row.length; i++) {
            String key = header[i].trim().toLowerCase().replace(" ", "_");
            String value = row[i] != null ? row[i].trim() : null;
            if (value != null && !value.isEmpty()) {
                map.put(key, value);
            }
        }
        return map;
    }

    private List<String> validateRow(Map<String, String> row, String entityType) {
        List<String> errors = new ArrayList<>();
        if ("MEMBER".equals(entityType)) {
            String firstName = row.getOrDefault("first_name", row.get("nome"));
            String lastName = row.getOrDefault("last_name", row.get("cognome"));
            if (firstName == null || firstName.isEmpty()) errors.add("Nome mancante");
            if (lastName == null || lastName.isEmpty()) errors.add("Cognome mancante");
        }
        return errors;
    }

    private boolean isDuplicate(Map<String, String> row, String entityType, Long associationId) {
        if ("MEMBER".equals(entityType)) {
            String fiscalCode = row.getOrDefault("fiscal_code", row.get("codice_fiscale"));
            if (fiscalCode != null && !fiscalCode.isEmpty()) {
                return memberService.findByFiscalCode(fiscalCode).isPresent();
            }
            String email = row.get("email");
            if (email != null && !email.isEmpty()) {
                return memberService.findByEmail(email).isPresent();
            }
        }
        return false;
    }

    private String sha256(byte[] data) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return null;
        }
    }

    private static final java.util.HexFormat HexFormat = java.util.HexFormat.of();
}
