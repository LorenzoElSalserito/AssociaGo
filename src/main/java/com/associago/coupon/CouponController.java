package com.associago.coupon;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coupons")
@CrossOrigin(origins = "*")
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
    
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, Object> payload) {
        Long associationId = ((Number) payload.get("associationId")).longValue();
        String code = (String) payload.get("code");
        BigDecimal amount = payload.containsKey("amount") ? new BigDecimal(payload.get("amount").toString()) : null;
        Long activityId = payload.containsKey("activityId") ? ((Number) payload.get("activityId")).longValue() : null;

        return couponService.findByCode(associationId, code)
                .map(coupon -> {
                    boolean isValid = couponService.isValid(coupon, amount, activityId);
                    if (isValid) {
                        BigDecimal discount = couponService.calculateDiscount(coupon, amount);
                        return ResponseEntity.ok(Map.of(
                            "valid", true,
                            "discount", discount,
                            "coupon", coupon
                        ));
                    } else {
                        return ResponseEntity.ok(Map.<String, Object>of("valid", false, "reason", "Conditions not met"));
                    }
                })
                .orElse(ResponseEntity.ok(Map.of("valid", false, "reason", "Coupon not found")));
    }
}
