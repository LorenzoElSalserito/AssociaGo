package com.associago.coupon;

import com.associago.coupon.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    @Autowired
    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> findByAssociationId(Long associationId) {
        return couponRepository.findByAssociationId(associationId);
    }

    public Optional<Coupon> findById(Long id) {
        return couponRepository.findById(id);
    }

    public Optional<Coupon> findByCode(Long associationId, String code) {
        return couponRepository.findByAssociationIdAndCode(associationId, code);
    }

    @Transactional
    public Coupon save(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteById(Long id) {
        couponRepository.deleteById(id);
    }

    public boolean isValid(Coupon coupon, BigDecimal amount, Long activityId) {
        return isValid(coupon, amount, activityId, null);
    }

    public boolean isValid(Coupon coupon, BigDecimal amount, Long activityId, Long eventId) {
        if (!coupon.isActive()) return false;

        LocalDate now = LocalDate.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) return false;
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) return false;

        if (coupon.getMaxUses() != null && coupon.getCurrentUses() >= coupon.getMaxUses()) return false;

        if (amount != null && coupon.getMinAmount() != null && amount.compareTo(coupon.getMinAmount()) < 0) return false;

        if (activityId != null && !coupon.getApplicableActivities().isEmpty()) {
            boolean isApplicable = coupon.getApplicableActivities().stream()
                    .anyMatch(a -> a.getId().equals(activityId));
            if (!isApplicable) return false;
        }

        if (eventId != null && !coupon.getApplicableEvents().isEmpty()) {
            boolean isApplicable = coupon.getApplicableEvents().stream()
                    .anyMatch(e -> e.getId().equals(eventId));
            if (!isApplicable) return false;
        }

        return true;
    }
    
    @Transactional
    public void incrementUsage(Long couponId) {
        couponRepository.findById(couponId).ifPresent(coupon -> {
            coupon.setCurrentUses(coupon.getCurrentUses() + 1);
            couponRepository.save(coupon);
        });
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal originalAmount) {
        if (originalAmount == null || originalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = originalAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = coupon.getDiscountValue();
        }

        // Ensure discount doesn't exceed original amount
        if (discount.compareTo(originalAmount) > 0) {
            discount = originalAmount;
        }
        
        return discount;
    }
}
