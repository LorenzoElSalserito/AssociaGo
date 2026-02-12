package com.associago.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import java.util.Optional;

/**
 * Utility per accedere all'utente corrente dal SecurityContext
 *
 * Usato principalmente per autenticazione OAuth2. Per client desktop
 * che usano l'header X-User-Id, usare CurrentUserArgumentResolver.
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.3.1 - Aggiunto getUserIdOrNull per controlli non-throwing
 */
public final class CurrentUserUtils {

    private CurrentUserUtils() {
    }

    /**
     * Ottiene il AssociaGoPrincipal dal SecurityContext (se presente)
     *
     * @return Optional contenente il principal OAuth2, vuoto se non autenticato
     */
    public static Optional<AssociaGoPrincipal> principal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof OAuth2AuthenticationToken)) {
            return Optional.empty();
        }
        Object principal = ((OAuth2AuthenticationToken) auth).getPrincipal();
        if (principal instanceof AssociaGoPrincipal p) {
            return Optional.of(p);
        }
        return Optional.empty();
    }

    /**
     * Ottiene l'ID utente dal SecurityContext OAuth2
     *
     * @return ID utente
     * @throws IllegalStateException se nessun utente autenticato via OAuth2
     */
    public static Long requireUserId() {
        return principal()
                .map(AssociaGoPrincipal::getLocalUserId)
                .orElseThrow(() -> new IllegalStateException("Utente non autenticato (AssociaGo)"));
    }

    /**
     * Ottiene l'ID utente dal SecurityContext OAuth2 senza lanciare eccezione
     *
     * @return Optional con ID utente, vuoto se non autenticato
     */
    public static Optional<Long> getUserIdOrNull() {
        return principal().map(AssociaGoPrincipal::getLocalUserId);
    }

    /**
     * Verifica se c'è un utente autenticato via OAuth2
     *
     * @return true se autenticato, false altrimenti
     */
    public static boolean isAuthenticated() {
        return principal().isPresent();
    }
}
