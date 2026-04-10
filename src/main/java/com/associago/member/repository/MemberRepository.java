package com.associago.member.repository;

import com.associago.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    long countByMembershipStatus(String status);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    Optional<Member> findByFiscalCode(String fiscalCode);
    Optional<Member> findByEmail(String email);
}
