package com.associago.coupon.repository;

import com.associago.coupon.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByAssociationId(Long associationId);
    Optional<Coupon> findByAssociationIdAndCode(Long associationId, String code);
    List<Coupon> findByAssociationIdAndCodeIgnoreCase(Long associationId, String code);

    /** Consumes one use only while the limit (null or 0 = unlimited) still allows it; returns the rows updated. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Coupon c SET c.currentUses = COALESCE(c.currentUses, 0) + 1 WHERE c.id = :id "
            + "AND (c.maxUses IS NULL OR c.maxUses <= 0 OR COALESCE(c.currentUses, 0) < c.maxUses)")
    int incrementUsageWithinLimit(@Param("id") Long id);
}
