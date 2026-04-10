package com.associago.federation;

import com.associago.federation.dto.FederationRegistrationRequest;
import com.associago.federation.dto.FederationRegistrationResult;
import com.associago.federation.dto.FederationVerificationResult;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * EOC (European Olympic Committees) federation adapter.
 * Stub for future European-level sports federation integration.
 */
@Component
@ConditionalOnProperty(name = "associago.federation.eoc.enabled", havingValue = "true", matchIfMissing = false)
public class EocAdapter implements SportsFederationProvider {

    @Override
    public String getProviderName() {
        return "EOC - European Olympic Committees";
    }

    @Override
    public String getProviderCode() {
        return "EOC_EU";
    }

    @Override
    public boolean isAvailable() {
        return false;
    }

    @Override
    public FederationRegistrationResult registerAssociation(FederationRegistrationRequest request) {
        return new FederationRegistrationResult(
                false, null,
                "EOC integration not yet available.",
                "EOC_EU"
        );
    }

    @Override
    public FederationVerificationResult verifyCertificate(String certificateNumber, String checksum) {
        return new FederationVerificationResult(
                false, certificateNumber, null, null, null,
                "UNVERIFIED", "EOC_EU",
                "EOC verification API not yet available."
        );
    }
}
