package com.associago.app;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.association.dto.AssociationDTO;
import com.associago.association.mapper.AssociationMapper;
import com.associago.config.AppConfig;
import com.associago.config.AppConfigManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/setup", "/api/v1/setup"})
public class SetupController {

    private final AppConfigManager configManager;
    private final ApplicationContext context;
    private final AssociationService associationService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public SetupController(AppConfigManager configManager, ApplicationContext context, AssociationService associationService, PasswordEncoder passwordEncoder) {
        this.configManager = configManager;
        this.context = context;
        this.associationService = associationService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        Map<String, Boolean> status = new HashMap<>();
        status.put("configured", configManager.loadConfig().isConfigured());
        return ResponseEntity.ok(status);
    }

    @PostMapping("/configure")
    public ResponseEntity<Void> configure(@RequestBody AppConfig config) {
        try {
            configManager.saveConfig(config);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/restart")
    public void restart() {
        Thread restartThread = new Thread(() -> {
            try {
                Thread.sleep(1000);
                SpringApplication.exit(context, () -> 0);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        restartThread.setDaemon(false);
        restartThread.start();
    }

    @PostMapping("/init")
    public ResponseEntity<AssociationDTO> initSetup(@RequestBody SetupRequest request) {
        Association association = new Association();
        association.setName(request.name);
        association.setSlug(request.slug);
        association.setEmail(request.email);
        association.setPassword(passwordEncoder.encode(request.password));
        association.setType(request.type);
        association.setTaxCode(request.fiscalCode);
        
        // Defaults
        association.setActive(true);
        association.setUseRemoteDb(false);
        association.setDbType("sqlite");
        
        Association savedAssoc = associationService.create(association);
        
        // Mark app as configured if not already
        AppConfig config = configManager.loadConfig();
        if (!config.isConfigured()) {
            config.setConfigured(true);
            try {
                configManager.saveConfig(config);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        
        return ResponseEntity.ok(AssociationMapper.toDTO(savedAssoc));
    }

    public static class SetupRequest {
        public String name;
        public String slug;
        public String email;
        public String password;
        public String type;
        public String fiscalCode;
    }
}
