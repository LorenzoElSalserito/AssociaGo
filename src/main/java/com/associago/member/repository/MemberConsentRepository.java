package com.associago.member.repository;

import com.associago.member.MemberConsent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberConsentRepository extends JpaRepository<MemberConsent, Long> {
    List<MemberConsent> findByMemberIdAndAssociationId(Long memberId, Long associationId);
    List<MemberConsent> findByAssociationId(Long associationId);
}
