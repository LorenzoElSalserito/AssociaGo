package com.associago.association.repository;

import com.associago.association.Association;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AssociationRepository extends JpaRepository<Association, Long> {
    Optional<Association> findBySlug(String slug);
    Optional<Association> findByEmail(String email);
}
