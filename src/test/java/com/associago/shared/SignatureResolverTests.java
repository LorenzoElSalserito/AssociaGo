package com.associago.shared;

import com.associago.association.Association;
import com.associago.association.repository.AssociationRepository;
import com.associago.signature.InstitutionalSignature;
import com.associago.signature.InstitutionalSignatureRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SignatureResolverTests {

    @TempDir Path assets;

    private final AssociationRepository associations = mock(AssociationRepository.class);
    private final InstitutionalSignatureRepository signatures = mock(InstitutionalSignatureRepository.class);

    @Test
    void prefersStoredSignatureAndFallsBackToOrganigramAndFiles() throws Exception {
        Association association = new Association();
        association.setId(7L);
        association.setPresident("Mario Rossi");
        association.setSecretary("Giulia Bianchi");
        when(associations.findById(7L)).thenReturn(Optional.of(association));
        when(signatures.findByAssociationIdAndSignerRole(anyLong(), anyString())).thenReturn(Optional.empty());

        InstitutionalSignature president = new InstitutionalSignature();
        president.setSignerRole("PRESIDENT");
        president.setSignerName("Anna Maria Verdi");
        president.setSignerTitle("Presidente pro tempore");
        president.setSignatureImage(new byte[]{1, 2, 3});
        when(signatures.findByAssociationIdAndSignerRole(7L, "PRESIDENT")).thenReturn(Optional.of(president));

        Path dir = Files.createDirectories(assets.resolve("7/signatures"));
        Files.write(dir.resolve("secretary.png"), new byte[]{9, 9});

        SignatureResolver resolver = new SignatureResolver(associations, signatures, assets.toString());
        List<SignatureResolver.SignerInfo> signers = resolver.resolveSigners(7L, List.of("president", "SECRETARY", "treasurer"));

        assertThat(signers).hasSize(3);
        assertThat(signers.get(0).fullName()).isEqualTo("Anna Maria Verdi");
        assertThat(signers.get(0).title()).isEqualTo("Presidente pro tempore");
        assertThat(signers.get(0).imageBytes()).containsExactly(1, 2, 3);
        assertThat(signers.get(1).fullName()).isEqualTo("Giulia Bianchi");
        assertThat(signers.get(1).title()).isNull();
        assertThat(signers.get(1).imageBytes()).containsExactly(9, 9);
        assertThat(signers.get(2).hasName()).isFalse();
        assertThat(signers.get(2).imageBytes()).isNull();
        assertThat(resolver.getMissingSigners(7L, List.of("president", "secretary", "treasurer"))).containsExactly("treasurer");
    }

    @Test
    void inactiveStoredSignatureIsIgnored() {
        Association association = new Association();
        association.setId(8L);
        association.setTreasurer("Elena Neri");
        when(associations.findById(8L)).thenReturn(Optional.of(association));
        InstitutionalSignature treasurer = new InstitutionalSignature();
        treasurer.setSignerName("Old Treasurer");
        treasurer.setActive(false);
        when(signatures.findByAssociationIdAndSignerRole(8L, "TREASURER")).thenReturn(Optional.of(treasurer));

        SignatureResolver resolver = new SignatureResolver(associations, signatures, assets.toString());
        assertThat(resolver.resolveSigners(8L, List.of("treasurer")).getFirst().fullName()).isEqualTo("Elena Neri");
    }
}
