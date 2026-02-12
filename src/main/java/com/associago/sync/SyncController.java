package com.associago.sync;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    private final SyncService syncService;

    @Autowired
    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @GetMapping("/config")
    public SyncConfig getConfig() {
        return syncService.getConfig();
    }

    @PostMapping("/config")
    public SyncConfig updateConfig(@RequestBody SyncConfig config) {
        return syncService.saveConfig(config);
    }

    @PostMapping("/test-connection")
    public ResponseEntity<Boolean> testConnection(@RequestBody SyncConfig config) {
        return ResponseEntity.ok(syncService.testConnection(config));
    }

    @PostMapping("/run")
    public ResponseEntity<Void> runSync() {
        try {
            syncService.performSync();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
