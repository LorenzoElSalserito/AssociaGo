package com.associago.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configurazione Spring Security per AssociaGo
 *
 * @author Lorenzo DM
 * @since 0.1.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            OAuth2UserProvisioningService oauth2UserProvisioningService,
            AuthProperties authProperties
    ) throws Exception {

        // Se auth disabilitata (desktop/dev) -> permetti tutto per non bloccare lo sviluppo.
        // CORS: in modalità desktop il renderer Electron carica da file:// e il browser
        // invia Origin: "null" (stringa letterale). Il pattern "file://*" NON lo matcha,
        // quindi usiamo "*" che accetta qualsiasi origin incluso "null".
        if (!authProperties.isEnabled()) {
            http.cors(cors -> {
                CorsConfiguration desktopCors = new CorsConfiguration();
                desktopCors.addAllowedOriginPattern("*");
                desktopCors.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                desktopCors.setAllowedHeaders(List.of("*"));
                desktopCors.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", desktopCors);
                cors.configurationSource(source);
            });
            http.csrf(AbstractHttpConfigurer::disable);
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            http.httpBasic(AbstractHttpConfigurer::disable);
            return http.build();
        }

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // Auth abilitata -> session-based con CSRF cookie (XSRF-TOKEN)
        http.csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
        );

        http.authorizeHttpRequests(auth -> auth
                // Endpoint pubblici (sempre accessibili)
                .requestMatchers(
                        "/error",
                        "/actuator/health",
                        "/actuator/info",
                        "/api/auth/login-url",
                        "/api/auth/csrf",
                        "/api/health"
                ).permitAll()
                // Endpoint bootstrap e setup (accessibili senza autenticazione per onboarding)
                .requestMatchers(
                        "/api/bootstrap",
                        "/api/bootstrap/**",
                        "/api/setup/**"
                ).permitAll()
                // OAuth2 e login
                .requestMatchers("/oauth2/**", "/login/**").permitAll()
                // Tutti gli altri endpoint API richiedono autenticazione
                .requestMatchers("/api/**").authenticated()
                // Richieste statiche (frontend) sempre permesse
                .anyRequest().permitAll()
        );

        http.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(oauth2UserProvisioningService))
                .successHandler(new OAuth2LoginSuccessHandler(authProperties))
        );

        http.logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                .invalidateHttpSession(true)
        );

        http.httpBasic(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Il pattern "*" è necessario per supportare l'origine "null" inviata
        // dalle applicazioni Electron/desktop che caricano da file://
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}