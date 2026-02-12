package com.associago.security;

import com.associago.user.User;
import com.associago.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2UserProvisioningService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private static final Logger log = LoggerFactory.getLogger(OAuth2UserProvisioningService.class);

    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final UserRepository userRepository;

    public OAuth2UserProvisioningService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        Map<String, Object> attrs = oauth2User.getAttributes();
        String email = asString(attrs.get("email"));
        String firstName = asString(attrs.get("given_name"));
        String lastName = asString(attrs.get("family_name"));
        
        // Fallback for name if given_name/family_name are missing
        if (firstName == null && attrs.get("name") != null) {
            String fullName = asString(attrs.get("name"));
            String[] parts = fullName.split(" ", 2);
            firstName = parts[0];
            if (parts.length > 1) {
                lastName = parts[1];
            }
        }

        User localUser = findOrCreateLocalUser(email, firstName, lastName);
        return new AssociaGoPrincipal(oauth2User, localUser.getId());
    }

    private User findOrCreateLocalUser(String email, String firstName, String lastName) {
        if (email != null) {
            Optional<User> byEmail = userRepository.findByEmailIgnoreCase(email);
            if (byEmail.isPresent()) {
                User u = byEmail.get();
                boolean updated = false;
                if (u.getFirstName() == null && firstName != null) {
                    u.setFirstName(firstName);
                    updated = true;
                }
                if (u.getLastName() == null && lastName != null) {
                    u.setLastName(lastName);
                    updated = true;
                }
                return updated ? userRepository.save(u) : u;
            }
        }

        User created = new User();
        created.setEmail(email);
        created.setFirstName(firstName != null ? firstName : "Unknown");
        created.setLastName(lastName != null ? lastName : "User");
        // Tax code is unique but we might not have it from OAuth2, so we leave it null or handle it
        // For now, let's assume it's not mandatory for OAuth2 users initially or generate a placeholder if needed
        // But User entity has taxCode unique=true, let's check if it's nullable. It is nullable in the entity definition above (no nullable=false).
        
        log.info("👤 Created new local AssociaGo user from OAuth2: email={}", email);
        return userRepository.save(created);
    }

    private static String asString(Object v) {
        return v == null ? null : String.valueOf(v);
    }
}
