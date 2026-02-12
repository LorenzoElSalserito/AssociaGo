package com.associago.user.repository;

import com.associago.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByTaxCode(String taxCode);
    Optional<User> findByEmailIgnoreCase(String email);
}
