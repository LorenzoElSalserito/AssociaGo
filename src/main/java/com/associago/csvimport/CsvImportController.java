package com.associago.csvimport;

import com.associago.csvimport.dto.ImportLogDTO;
import com.associago.csvimport.mapper.ImportLogMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CsvImportController {

    private final CsvImportService csvImportService;

    public CsvImportController(CsvImportService csvImportService) {
        this.csvImportService = csvImportService;
    }

    @GetMapping("/imports")
    public List<ImportLogDTO> getHistory(@RequestParam Long associationId) {
        return csvImportService.getHistory(associationId).stream()
                .map(ImportLogMapper::toDTO)
                .toList();
    }

    @PostMapping("/members/import-csv")
    public ResponseEntity<ImportLogDTO> importMembers(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long associationId,
            @RequestParam(required = false) Long importedBy) throws IOException {
        ImportLog result = csvImportService.importMembers(file, associationId, importedBy);
        return ResponseEntity.ok(ImportLogMapper.toDTO(result));
    }

    @PostMapping("/members/import-csv/preview")
    public ResponseEntity<ImportLogDTO> previewMembers(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long associationId,
            @RequestParam(required = false) Long importedBy) throws IOException {
        ImportLog result = csvImportService.preview(file, associationId, "MEMBER", importedBy);
        return ResponseEntity.ok(ImportLogMapper.toDTO(result));
    }

    @PostMapping("/activities/{activityId}/import-csv")
    public ResponseEntity<ImportLogDTO> importActivityParticipants(
            @PathVariable Long activityId,
            @RequestParam("file") MultipartFile file,
            @RequestParam Long associationId,
            @RequestParam(required = false) Long importedBy) throws IOException {
        ImportLog result = csvImportService.preview(file, associationId, "ACTIVITY_PARTICIPANT", importedBy);
        return ResponseEntity.ok(ImportLogMapper.toDTO(result));
    }

    @PostMapping("/events/{eventId}/import-csv")
    public ResponseEntity<ImportLogDTO> importEventParticipants(
            @PathVariable Long eventId,
            @RequestParam("file") MultipartFile file,
            @RequestParam Long associationId,
            @RequestParam(required = false) Long importedBy) throws IOException {
        ImportLog result = csvImportService.preview(file, associationId, "EVENT_PARTICIPANT", importedBy);
        return ResponseEntity.ok(ImportLogMapper.toDTO(result));
    }

    @PostMapping("/imports/{id}/confirm")
    public ResponseEntity<ImportLogDTO> confirmImport(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(ImportLogMapper.toDTO(csvImportService.confirmImport(id)));
    }
}
