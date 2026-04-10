package com.associago.federation;

import com.associago.federation.dto.FederationRegistrationRequest;
import com.associago.federation.dto.FederationRegistrationResult;
import com.associago.federation.dto.FederationVerificationResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/federation")
public class FederationController {

    private final List<SportsFederationProvider> providers;

    public FederationController(List<SportsFederationProvider> providers) {
        this.providers = providers != null ? providers : List.of();
    }

    @GetMapping("/providers")
    public List<Map<String, Object>> listProviders() {
        return providers.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("code", p.getProviderCode());
            m.put("name", p.getProviderName());
            m.put("available", p.isAvailable());
            return m;
        }).toList();
    }

    @PostMapping("/register")
    public ResponseEntity<FederationRegistrationResult> register(
            @RequestBody FederationRegistrationRequest request,
            @RequestParam(defaultValue = "CONI_IT") String providerCode) {
        SportsFederationProvider provider = findProvider(providerCode);
        if (provider == null) {
            return ResponseEntity.badRequest().body(
                    new FederationRegistrationResult(false, null, "Provider not found: " + providerCode, providerCode)
            );
        }
        return ResponseEntity.ok(provider.registerAssociation(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<FederationVerificationResult> verify(
            @RequestParam String number,
            @RequestParam String checksum,
            @RequestParam(defaultValue = "CONI_IT") String providerCode) {
        SportsFederationProvider provider = findProvider(providerCode);
        if (provider == null) {
            return ResponseEntity.badRequest().body(
                    new FederationVerificationResult(false, number, null, null, null, "ERROR", providerCode, "Provider not found")
            );
        }
        return ResponseEntity.ok(provider.verifyCertificate(number, checksum));
    }

    private SportsFederationProvider findProvider(String code) {
        return providers.stream()
                .filter(p -> p.getProviderCode().equals(code))
                .findFirst()
                .orElse(null);
    }
}
