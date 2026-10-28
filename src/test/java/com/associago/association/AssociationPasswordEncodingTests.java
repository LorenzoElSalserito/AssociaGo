package com.associago.association;

import com.associago.association.repository.AssociationRepository;
import java.io.File;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AssociationPasswordEncodingTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(
                    System.getProperty("java.io.tmpdir"),
                    "associago-test-" + UUID.randomUUID()
            );
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired
    private AssociationService associationService;

    @Autowired
    private AssociationRepository associationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanAssociations() {
        associationRepository.deleteAll();
    }

    @Test
    void updatingAssociationDetailsDoesNotReencodeExistingPassword() {
        Association association = new Association();
        association.setName("Test Association");
        association.setSlug("test-association");
        association.setEmail("test@example.org");
        association.setPassword("secret-password");
        association.setType("APS");

        Association saved = associationService.create(association);
        String encodedPassword = saved.getPassword();

        saved.setName("Updated Test Association");
        Association updated = associationService.update(saved.getId(), saved);

        assertThat(updated.getPassword()).isEqualTo(encodedPassword);
        assertThat(passwordEncoder.matches("secret-password", updated.getPassword())).isTrue();
    }

    @Test
    void legacyPlainTextPasswordMatchesAndCanBeUpgraded() {
        Association association = new Association();
        association.setName("Legacy Association");
        association.setSlug("legacy-association");
        association.setEmail("legacy@example.org");
        association.setPassword("legacy-password");
        association.setType("APS");
        Association saved = associationRepository.save(association);

        assertThat(associationService.passwordMatches("legacy-password", saved.getPassword())).isTrue();

        associationService.upgradePasswordHash(saved.getId(), "legacy-password");

        Association upgraded = associationRepository.findById(saved.getId()).orElseThrow();
        assertThat(upgraded.getPassword()).isNotEqualTo("legacy-password");
        assertThat(passwordEncoder.matches("legacy-password", upgraded.getPassword())).isTrue();
    }
}
