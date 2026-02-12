package com.associago.member;

import com.associago.member.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
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
            member.setUpdatedAt(LocalDateTime.now());
            return memberRepository.save(member);
        }).orElseThrow(() -> new RuntimeException("Member not found"));
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }
}
