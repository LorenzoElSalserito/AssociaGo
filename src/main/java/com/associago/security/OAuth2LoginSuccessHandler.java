package com.associago.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.net.URI;

public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthProperties authProperties;

    public OAuth2LoginSuccessHandler(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        String target = authProperties.getPostLoginRedirect();
        if (target == null || target.isBlank()) target = "/";

        if (!isSafeRedirect(target)) target = "/";

        response.setStatus(302);
        response.setHeader("Location", target);
    }

    private boolean isSafeRedirect(String target) {
        if (target.startsWith("/")) return true;

        try {
            URI uri = URI.create(target);
            String scheme = uri.getScheme();
            if (scheme == null) return false;

            if (!scheme.equals("http") && !scheme.equals("https") && !scheme.equals("file")) return false;
            if (scheme.equals("file")) return true;

            String host = uri.getHost();
            return "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host);
        } catch (Exception e) {
            return false;
        }
    }
}
