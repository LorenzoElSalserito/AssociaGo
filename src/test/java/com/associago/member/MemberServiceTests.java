package com.associago.member;

import com.associago.member.repository.MemberConsentRepository;
import com.associago.member.repository.MemberRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemberServiceTests {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private MemberConsentRepository consentRepository;

    @Test
    void createCalculatesCompletenessAndTimestamps() {
        MemberService service = new MemberService(memberRepository, consentRepository);
        Member member = completeMember();
        when(memberRepository.save(member)).thenReturn(member);

        Member saved = service.createMember(member);

        assertThat(saved.getCompletenessScore()).isEqualTo(100);
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        verify(memberRepository).save(member);
    }

    @Test
    void updateRecalculatesCompletenessWithoutReplacingIdentity() {
        MemberService service = new MemberService(memberRepository, consentRepository);
        Member stored = new Member();
        stored.setId(7L);
        Member details = completeMember();
        when(memberRepository.findById(7L)).thenReturn(Optional.of(stored));
        when(memberRepository.save(stored)).thenReturn(stored);

        Member updated = service.updateMember(7L, details);

        assertThat(updated.getId()).isEqualTo(7L);
        assertThat(updated.getCompletenessScore()).isEqualTo(100);
        assertThat(updated.getFirstName()).isEqualTo("Ada");
    }

    @Test
    void duplicateFoundByEmailAndFiscalCodeIsReturnedOnce() {
        MemberService service = new MemberService(memberRepository, consentRepository);
        Member duplicate = completeMember();
        duplicate.setId(11L);
        when(memberRepository.findByEmail("ada@example.org")).thenReturn(Optional.of(duplicate));
        when(memberRepository.findByFiscalCode("RSSMRA80A01H501U")).thenReturn(Optional.of(duplicate));

        List<Member> duplicates = service.findDuplicates("ada@example.org", "RSSMRA80A01H501U");

        assertThat(duplicates).containsExactly(duplicate);
    }

    @Test
    void consentLifecycleRecordsGrantAndRevocation() {
        MemberService service = new MemberService(memberRepository, consentRepository);
        ArgumentCaptor<MemberConsent> captor = ArgumentCaptor.forClass(MemberConsent.class);
        when(consentRepository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        MemberConsent granted = service.grantConsent(3L, 4L, "PRIVACY", "CONSENT");

        assertThat(granted.isGranted()).isTrue();
        assertThat(granted.getGrantedAt()).isNotNull();
        when(consentRepository.findById(9L)).thenReturn(Optional.of(granted));

        MemberConsent revoked = service.revokeConsent(9L);

        assertThat(revoked.isGranted()).isFalse();
        assertThat(revoked.getRevokedAt()).isNotNull();
    }

    private Member completeMember() {
        Member member = new Member();
        member.setFirstName("Ada");
        member.setLastName("Rossi");
        member.setEmail("ada@example.org");
        member.setPhone("123456789");
        member.setAddress("Via Roma 1");
        member.setFiscalCode("RSSMRA80A01H501U");
        member.setBirthDate(LocalDate.of(1980, 1, 1));
        member.setMemberCategory("ordinary");
        return member;
    }
}
