package com.associago.member.mapper;

import com.associago.member.Member;
import com.associago.member.dto.MemberCreateDTO;
import com.associago.member.dto.MemberDTO;
import com.associago.member.dto.MemberUpdateDTO;

public final class MemberMapper {

    private MemberMapper() {}

    public static MemberDTO toDTO(Member member) {
        return new MemberDTO(
                member.getId(),
                member.getFirstName(),
                member.getLastName(),
                member.getEmail(),
                member.getPhone(),
                member.getAddress(),
                member.getFiscalCode(),
                member.getBirthDate(),
                member.getMembershipStatus(),
                member.getMemberType(),
                member.getCompletenessScore(),
                member.getMemberCategory(),
                member.getCreatedAt(),
                member.getUpdatedAt()
        );
    }

    public static Member toEntity(MemberCreateDTO dto) {
        Member member = new Member();
        member.setFirstName(dto.firstName());
        member.setLastName(dto.lastName());
        member.setEmail(dto.email());
        member.setPhone(dto.phone());
        member.setAddress(dto.address());
        member.setFiscalCode(dto.fiscalCode());
        member.setBirthDate(dto.birthDate());
        member.setMemberType(dto.memberType());
        member.setMemberCategory(dto.memberCategory());
        return member;
    }

    public static void updateEntity(Member member, MemberUpdateDTO dto) {
        member.setFirstName(dto.firstName());
        member.setLastName(dto.lastName());
        member.setEmail(dto.email());
        member.setPhone(dto.phone());
        member.setAddress(dto.address());
        member.setFiscalCode(dto.fiscalCode());
        member.setBirthDate(dto.birthDate());
        member.setMemberType(dto.memberType());
        member.setMemberCategory(dto.memberCategory());
    }
}
