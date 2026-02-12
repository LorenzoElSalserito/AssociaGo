package com.associago.coupon.repository;

import com.associago.coupon.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByAssociationId(Long associationId);
    Optional<Coupon> findByAssociationIdAndCode(Long associationId, String code);
}
