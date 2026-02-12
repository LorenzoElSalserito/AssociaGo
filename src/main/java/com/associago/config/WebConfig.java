package com.associago.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${associago.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Value("${associago.cors.allow-credentials}")
    private boolean allowCredentials;

    @Value("${associago.cors.max-age-seconds}")
    private long maxAgeSeconds;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(allowCredentials)
                .maxAge(maxAgeSeconds);
    }
}
