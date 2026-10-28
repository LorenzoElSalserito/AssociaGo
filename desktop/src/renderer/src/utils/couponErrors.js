const COUPON_ERRORS = ['COUPON_NOT_FOUND', 'COUPON_INACTIVE', 'COUPON_NOT_STARTED', 'COUPON_EXPIRED',
  'COUPON_USAGE_LIMIT', 'COUPON_MIN_AMOUNT', 'COUPON_NOT_APPLICABLE'];

/** Translates a backend coupon rejection code; null for anything else. */
export const couponErrorMessage = (code, t) =>
  COUPON_ERRORS.includes(code) ? t(`couponApply.errors.${code}`) : null;
