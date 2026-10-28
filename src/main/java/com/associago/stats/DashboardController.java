package com.associago.stats;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@RestController
@RequestMapping({"/api/dashboard", "/api/v1/dashboard"})
public class DashboardController {

    private final DashboardOverviewService overviewService;

    public DashboardController(DashboardOverviewService overviewService) {
        this.overviewService = overviewService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestHeader("X-Association-Id") Long associationId) {
        return ResponseEntity.ok(overviewService.overview(associationId));
    }
}
