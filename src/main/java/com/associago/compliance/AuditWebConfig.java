package com.associago.compliance;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** The database connection lives in a config file, not an entity: audit its successful saves at the web layer. */
@Configuration
public class AuditWebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AuditWebConfig.class);

    private final AuditService auditService;

    public AuditWebConfig(AuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
                if (ex != null || !"POST".equals(request.getMethod()) || response.getStatus() >= 300) return;
                try {
                    auditService.log(AuditEventListener.requestAssociationId(), null, "UPDATE",
                            AuditAreas.DATABASE_CONFIG, null, null);
                } catch (RuntimeException e) {
                    log.warn("Audit entry not recorded for database settings: {}", e.getMessage());
                }
            }
        }).addPathPatterns("/api/v1/database");
    }
}
