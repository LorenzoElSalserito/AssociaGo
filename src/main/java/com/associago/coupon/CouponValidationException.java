package com.associago.coupon;

/** Coupon rejection carrying a stable code (e.g. COUPON_EXPIRED) that the renderer translates. */
public class CouponValidationException extends IllegalArgumentException {

    private final String code;

    public CouponValidationException(String code) {
        super(code);
        this.code = code;
    }

    public String getCode() { return code; }
}
