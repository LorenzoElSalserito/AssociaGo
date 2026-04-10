package com.associago.federation;

import com.associago.federation.dto.FederationRegistrationRequest;
import com.associago.federation.dto.FederationRegistrationResult;
import com.associago.federation.dto.FederationVerificationResult;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * CONI (Comitato Olimpico Nazionale Italiano) federation adapter.
 * Currently a stub — real integration will be implemented when
 * CONI publishes stable public APIs for ASD registration and verification.
 */
@Component
@ConditionalOnProperty(name = "associago.federation.coni.enabled", havingValue = "true", matchIfMissing = false)
public class ConiAdapter implements SportsFederationProvider {

    @Override
    public String getProviderName() {
        return "CONI - Comitato Olimpico Nazionale Italiano";
    }

    @Override
    public String getProviderCode() {
        return "CONI_IT";
    }

    @Override
    public boolean isAvailable() {
        // Stub: always return false until real API integration
        return false;
    }

    @Override
    public FederationRegistrationResult registerAssociation(FederationRegistrationRequest request) {
        return new FederationRegistrationResult(
                false,
                null,
                "CONI integration not yet available. Registration must be completed manually at https://www.coni.it",
                "CONI_IT"
        );
    }

    @Override
    public FederationVerificationResult verifyCertificate(String certificateNumber, String checksum) {
        return new FederationVerificationResult(
                false, certificateNumber, null, null, null,
                "UNVERIFIED",
                "CONI_IT",
                "CONI verification API not yet available."
        );
    }
}
