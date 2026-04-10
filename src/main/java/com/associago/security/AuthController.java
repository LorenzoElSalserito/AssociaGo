package com.associago.security;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.association.mapper.AssociationMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
public class AuthController {

    private final AssociationService associationService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(AssociationService associationService, PasswordEncoder passwordEncoder) {
        this.associationService = associationService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        Optional<Association> associationOpt = associationService.findById(loginRequest.associationId);

        if (associationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Association not found");
        }

        Association association = associationOpt.get();

        if (!passwordEncoder.matches(loginRequest.password, association.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        // Create Authentication Token
        // We use the Association ID as the "principal" for simplicity in this local-first context
        // Role is ADMIN since this is the master password login
        UsernamePasswordAuthenticationToken authReq = new UsernamePasswordAuthenticationToken(
                association.getId().toString(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        // Manually set the security context
        SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(authReq);

        // Create Session and save context
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);

        return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "association", AssociationMapper.toDTO(association),
            "sessionId", session.getId()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "principal", authentication.getPrincipal(),
                "authorities", authentication.getAuthorities()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
    }

    // DTO
    public static class LoginRequest {
        public Long associationId;
        public String password;
    }
}
