package com.associago.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "associago.auth")
public class AuthProperties {

    /**
     * Se false: backend parte senza IdP (dev/desktop).
     * Se true: abilita OAuth2 login e protegge /api/**.
     */
    private boolean enabled = false;

    private String postLoginRedirect = "http://localhost:5173/";

    private String registrationId = "associago";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getPostLoginRedirect() {
        return postLoginRedirect;
    }

    public void setPostLoginRedirect(String postLoginRedirect) {
        this.postLoginRedirect = postLoginRedirect;
    }

    public String getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(String registrationId) {
        this.registrationId = registrationId;
    }
}
