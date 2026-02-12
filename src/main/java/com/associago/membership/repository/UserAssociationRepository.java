package com.associago.membership.repository;

import com.associago.membership.UserAssociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAssociationRepository extends JpaRepository<UserAssociation, Long> {
    List<UserAssociation> findByAssociationId(Long associationId);
    List<UserAssociation> findByUserId(Long userId);
    Optional<UserAssociation> findByUserIdAndAssociationId(Long userId, Long associationId);
}
