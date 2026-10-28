package com.associago.coupon;

import com.associago.activity.Activity;
import com.associago.activity.repository.ActivityRepository;
import com.associago.coupon.repository.CouponRepository;
import com.associago.event.Event;
import com.associago.event.repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    public static final String NOT_FOUND = "COUPON_NOT_FOUND";
    public static final String INACTIVE = "COUPON_INACTIVE";
    public static final String NOT_STARTED = "COUPON_NOT_STARTED";
    public static final String EXPIRED = "COUPON_EXPIRED";
    public static final String USAGE_LIMIT = "COUPON_USAGE_LIMIT";
    public static final String MIN_AMOUNT = "COUPON_MIN_AMOUNT";
    public static final String NOT_APPLICABLE = "COUPON_NOT_APPLICABLE";

    private final CouponRepository couponRepository;
    private final ActivityRepository activityRepository;
    private final EventRepository eventRepository;

    @Autowired
    public CouponService(CouponRepository couponRepository,
                         ActivityRepository activityRepository,
                         EventRepository eventRepository) {
        this.couponRepository = couponRepository;
        this.activityRepository = activityRepository;
        this.eventRepository = eventRepository;
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
        return validationError(coupon, amount, activityId, eventId) == null;
    }

    /** Returns null when the coupon can be applied, otherwise a stable error code. */
    public String validationError(Coupon coupon, BigDecimal amount, Long activityId, Long eventId) {
        if (!coupon.isActive()) return INACTIVE;

        LocalDate today = LocalDate.now();
        if (coupon.getStartDate() != null && today.isBefore(coupon.getStartDate())) return NOT_STARTED;
        if (coupon.getEndDate() != null && today.isAfter(coupon.getEndDate())) return EXPIRED;

        // A coupon linked to any activity or event is valid only for the linked ones; no links means valid everywhere.
        boolean restricted = !coupon.getApplicableActivities().isEmpty() || !coupon.getApplicableEvents().isEmpty();
        if (restricted && activityId != null
                && coupon.getApplicableActivities().stream().noneMatch(a -> activityId.equals(a.getId()))) {
            return NOT_APPLICABLE;
        }
        if (restricted && eventId != null
                && coupon.getApplicableEvents().stream().noneMatch(e -> eventId.equals(e.getId()))) {
            return NOT_APPLICABLE;
        }

        if (amount != null && coupon.getMinAmount() != null && amount.compareTo(coupon.getMinAmount()) < 0) {
            return MIN_AMOUNT;
        }
        if (limitReached(coupon)) return USAGE_LIMIT;
        return null;
    }

    private static boolean limitReached(Coupon coupon) {
        Integer max = coupon.getMaxUses();
        int used = coupon.getCurrentUses() != null ? coupon.getCurrentUses() : 0;
        return max != null && max > 0 && used >= max;
    }

    /** Validates a code against an amount and target, throwing {@link CouponValidationException} when rejected. */
    @Transactional
    public CouponQuote quote(Long associationId, String code, BigDecimal amount, Long activityId, Long eventId) {
        Coupon coupon = resolve(associationId, code);
        String error = validationError(coupon, amount, activityId, eventId);
        if (error != null) throw new CouponValidationException(error);
        BigDecimal original = amount != null ? amount : BigDecimal.ZERO;
        BigDecimal discount = calculateDiscount(coupon, original);
        return new CouponQuote(coupon, original, discount, original.subtract(discount));
    }

    @Transactional
    public CouponQuote quoteForActivity(Long activityId, String code) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new EntityNotFoundException("Activity not found"));
        return quote(activity.getAssociationId(), code, activityPrice(activity), activityId, null);
    }

    @Transactional
    public CouponQuote quoteForEvent(Long eventId, String code, boolean member, Long fallbackAssociationId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        Long associationId = event.getAssociationId() != null ? event.getAssociationId() : fallbackAssociationId;
        return quote(associationId, code, eventPrice(event, member), null, eventId);
    }

    public static BigDecimal activityPrice(Activity activity) {
        return activity.getCost() != null ? activity.getCost() : BigDecimal.ZERO;
    }

    public static BigDecimal eventPrice(Event event, boolean member) {
        BigDecimal price = member ? event.getCostMember() : event.getCostNonMember();
        return price != null ? price : BigDecimal.ZERO;
    }

    private Coupon resolve(Long associationId, String code) {
        String trimmed = code != null ? code.trim() : "";
        if (associationId == null || trimmed.isEmpty()) throw new CouponValidationException(NOT_FOUND);
        List<Coupon> matches = couponRepository.findByAssociationIdAndCodeIgnoreCase(associationId, trimmed);
        return matches.stream().filter(c -> trimmed.equals(c.getCode())).findFirst()
                .or(() -> matches.stream().findFirst())
                .orElseThrow(() -> new CouponValidationException(NOT_FOUND));
    }

    /**
     * Consumes one use atomically; must run in the registration's transaction so a failed save
     * rolls the counter back. Uses are never given back when a participant is removed.
     */
    @Transactional
    public void redeem(Long couponId) {
        if (couponRepository.incrementUsageWithinLimit(couponId) == 0) {
            throw new CouponValidationException(USAGE_LIMIT);
        }
    }

    @Transactional
    public void incrementUsage(Long couponId) {
        couponRepository.incrementUsageWithinLimit(couponId);
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal originalAmount) {
        if (originalAmount == null || originalAmount.compareTo(BigDecimal.ZERO) <= 0 || coupon.getDiscountValue() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = originalAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = coupon.getDiscountValue();
        }
        if (discount.signum() < 0) discount = BigDecimal.ZERO;
        if (discount.compareTo(originalAmount) > 0) discount = originalAmount;
        return discount;
    }

    public record CouponQuote(Coupon coupon, BigDecimal originalAmount, BigDecimal discount, BigDecimal finalAmount) {}
}
