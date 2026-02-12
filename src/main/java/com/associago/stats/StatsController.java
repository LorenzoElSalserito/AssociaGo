package com.associago.stats;

import com.associago.stats.dto.ActivityStatsDTO;
import com.associago.stats.dto.AssemblyStatsDTO;
import com.associago.stats.dto.FinancialStatsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/general")
    public ResponseEntity<Map<String, Object>> getGeneralStats() {
        return ResponseEntity.ok(statsService.getGeneralStats());
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<ActivityStatsDTO> getActivityStats(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getActivityStats(id));
    }

    @GetMapping("/assemblies/{id}")
    public ResponseEntity<AssemblyStatsDTO> getAssemblyStats(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getAssemblyStats(id));
    }

    @GetMapping("/financial")
    public ResponseEntity<FinancialStatsDTO> getFinancialStats(@RequestParam Long associationId, @RequestParam int year) {
        return ResponseEntity.ok(statsService.getFinancialStats(associationId, year));
    }
}
