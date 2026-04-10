package com.associago.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${associago.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Value("${associago.cors.allow-credentials}")
    private boolean allowCredentials;

    @Value("${associago.cors.max-age-seconds}")
    private long maxAgeSeconds;

    @Value("${associago.auth.enabled}")
    private boolean authEnabled;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // In desktop mode (auth disabled) the Electron renderer loads from file://
        // and browsers send Origin: "null" (literal). Use "*" pattern to accept any origin.
        List<String> patterns = authEnabled
                ? allowedOrigins
                : new ArrayList<>(List.of("*"));

        registry.addMapping("/**")
                .allowedOriginPatterns(patterns.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(allowCredentials)
                .maxAge(maxAgeSeconds);
    }
}
