package com.associago.coupon;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coupons")
public class CouponController {

    private final CouponService couponService;

    @Autowired
    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/association/{associationId}")
    public List<Coupon> getCouponsByAssociation(@PathVariable Long associationId) {
        return couponService.findByAssociationId(associationId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getCouponById(@PathVariable Long id) {
        return couponService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Coupon createCoupon(@RequestBody Coupon coupon) {
        return couponService.save(coupon);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @RequestBody Coupon details) {
        return couponService.findById(id)
                .map(existing -> {
                    existing.setCode(details.getCode());
                    existing.setDescription(details.getDescription());
                    existing.setDiscountType(details.getDiscountType());
                    existing.setDiscountValue(details.getDiscountValue());
                    existing.setStartDate(details.getStartDate());
                    existing.setEndDate(details.getEndDate());
                    existing.setMaxUses(details.getMaxUses());
                    existing.setActive(details.isActive());
                    existing.setMinAmount(details.getMinAmount());
                    existing.setApplicableActivities(details.getApplicableActivities());
                    existing.setApplicableEvents(details.getApplicableEvents());
                    return ResponseEntity.ok(couponService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        if (couponService.findById(id).isPresent()) {
            couponService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Previews a coupon. With activityId/eventId the base amount comes from the activity cost or the
     * event member/non-member cost ("member" flag); otherwise "amount" is used. Rejections return
     * valid=false with a stable "reason" code.
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-Association-Id", required = false) Long headerAssociationId) {
        Long associationId = payload.get("associationId") instanceof Number n ? n.longValue() : headerAssociationId;
        String code = payload.get("code") != null ? payload.get("code").toString() : null;
        Long activityId = payload.get("activityId") instanceof Number n ? n.longValue() : null;
        Long eventId = payload.get("eventId") instanceof Number n ? n.longValue() : null;
        try {
            CouponService.CouponQuote quote;
            if (activityId != null) {
                quote = couponService.quoteForActivity(activityId, code);
            } else if (eventId != null) {
                boolean member = !Boolean.FALSE.equals(payload.get("member"));
                quote = couponService.quoteForEvent(eventId, code, member, associationId);
            } else {
                BigDecimal amount = payload.get("amount") != null ? new BigDecimal(payload.get("amount").toString()) : null;
                quote = couponService.quote(associationId, code, amount, null, null);
            }
            Coupon coupon = quote.coupon();
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("valid", true);
            body.put("couponId", coupon.getId());
            body.put("code", coupon.getCode());
            body.put("discountType", coupon.getDiscountType());
            body.put("discountValue", coupon.getDiscountValue());
            body.put("originalAmount", quote.originalAmount());
            body.put("discount", quote.discount());
            body.put("finalAmount", quote.finalAmount());
            return ResponseEntity.ok(body);
        } catch (CouponValidationException e) {
            return ResponseEntity.ok(Map.of("valid", false, "reason", e.getCode()));
        }
    }
}
