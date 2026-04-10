package com.associago.member;

import com.associago.member.repository.MemberConsentRepository;
import com.associago.member.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberConsentRepository consentRepository;

    public MemberService(MemberRepository memberRepository, MemberConsentRepository consentRepository) {
        this.memberRepository = memberRepository;
        this.consentRepository = consentRepository;
    }

    public Iterable<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }

    @Transactional
    public Member createMember(Member member) {
        member.setCreatedAt(LocalDateTime.now());
        member.setUpdatedAt(LocalDateTime.now());
        member.setCompletenessScore(calculateCompleteness(member));
        return memberRepository.save(member);
    }

    @Transactional
    public Member updateMember(Long id, Member memberDetails) {
        return memberRepository.findById(id).map(member -> {
            member.setFirstName(memberDetails.getFirstName());
            member.setLastName(memberDetails.getLastName());
            member.setEmail(memberDetails.getEmail());
            member.setPhone(memberDetails.getPhone());
            member.setAddress(memberDetails.getAddress());
            member.setFiscalCode(memberDetails.getFiscalCode());
            member.setBirthDate(memberDetails.getBirthDate());
            member.setMembershipStatus(memberDetails.getMembershipStatus());
            member.setMemberType(memberDetails.getMemberType());
            member.setMemberCategory(memberDetails.getMemberCategory());
            member.setCompletenessScore(calculateCompleteness(member));
            member.setUpdatedAt(LocalDateTime.now());
            return memberRepository.save(member);
        }).orElseThrow(() -> new RuntimeException("Member not found"));
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    public Optional<Member> findByFiscalCode(String fiscalCode) {
        return memberRepository.findByFiscalCode(fiscalCode);
    }

    public Optional<Member> findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    /**
     * Rileva duplicati per email e/o codice fiscale.
     * Restituisce la lista di membri potenzialmente duplicati.
     */
    public List<Member> findDuplicates(String email, String fiscalCode) {
        List<Member> duplicates = new ArrayList<>();
        if (email != null && !email.isBlank()) {
            memberRepository.findByEmail(email).ifPresent(duplicates::add);
        }
        if (fiscalCode != null && !fiscalCode.isBlank()) {
            memberRepository.findByFiscalCode(fiscalCode).ifPresent(m -> {
                if (duplicates.stream().noneMatch(d -> d.getId().equals(m.getId()))) {
                    duplicates.add(m);
                }
            });
        }
        return duplicates;
    }

    // --- Consent Management ---

    public List<MemberConsent> getConsents(Long memberId, Long associationId) {
        return consentRepository.findByMemberIdAndAssociationId(memberId, associationId);
    }

    @Transactional
    public MemberConsent grantConsent(Long memberId, Long associationId, String consentType, String lawfulBasis) {
        MemberConsent consent = new MemberConsent();
        consent.setMemberId(memberId);
        consent.setAssociationId(associationId);
        consent.setConsentType(consentType);
        consent.setLawfulBasis(lawfulBasis);
        consent.setGranted(true);
        consent.setGrantedAt(LocalDateTime.now());
        consent.setCreatedAt(LocalDateTime.now());
        consent.setUpdatedAt(LocalDateTime.now());
        return consentRepository.save(consent);
    }

    @Transactional
    public MemberConsent revokeConsent(Long consentId) {
        return consentRepository.findById(consentId).map(consent -> {
            consent.setGranted(false);
            consent.setRevokedAt(LocalDateTime.now());
            consent.setUpdatedAt(LocalDateTime.now());
            return consentRepository.save(consent);
        }).orElseThrow(() -> new RuntimeException("Consent not found"));
    }

    // --- Completeness Score ---

    /**
     * Calcola il punteggio di completezza dell'anagrafica (0-100).
     */
    private int calculateCompleteness(Member member) {
        int score = 0;
        int total = 8; // campi valutati

        if (member.getFirstName() != null && !member.getFirstName().isBlank()) score++;
        if (member.getLastName() != null && !member.getLastName().isBlank()) score++;
        if (member.getEmail() != null && !member.getEmail().isBlank()) score++;
        if (member.getPhone() != null && !member.getPhone().isBlank()) score++;
        if (member.getAddress() != null && !member.getAddress().isBlank()) score++;
        if (member.getFiscalCode() != null && !member.getFiscalCode().isBlank()) score++;
        if (member.getBirthDate() != null) score++;
        if (member.getMemberCategory() != null && !member.getMemberCategory().isBlank()) score++;

        return (int) Math.round((double) score / total * 100);
    }
}
