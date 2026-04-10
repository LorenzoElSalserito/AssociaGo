package com.associago.federation;

import com.associago.federation.dto.FederationRegistrationRequest;
import com.associago.federation.dto.FederationRegistrationResult;
import com.associago.federation.dto.FederationVerificationResult;

/**
 * Interface for sports federation integration providers.
 * Each national or supranational federation (CONI, EOC, etc.)
 * implements this interface to provide certification and registration services.
 */
public interface SportsFederationProvider {

    /** Human-readable name (e.g., "CONI - Comitato Olimpico Nazionale Italiano"). */
    String getProviderName();

    /** Machine-readable code (e.g., "CONI_IT", "EOC_EU"). */
    String getProviderCode();

    /** Check if the provider's external services are reachable. */
    boolean isAvailable();

    /** Register an association with the federation. */
    FederationRegistrationResult registerAssociation(FederationRegistrationRequest request);

    /** Verify a certificate against the federation's registry. */
    FederationVerificationResult verifyCertificate(String certificateNumber, String checksum);
}
