import React, { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TicketPercent, X } from 'lucide-react';
import { associago } from '../api';
import { couponErrorMessage } from '../utils/couponErrors';


/**
 * Optional coupon code with an "Apply" preview. The server re-validates on save,
 * so the preview is informative only. `target` is { activityId } or { eventId, member }.
 */
const CouponField = ({ target, code, onCodeChange, onPreview }) => {
  const { t, i18n } = useTranslation();
  const inputId = useId();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const targetKey = JSON.stringify(target);

  const money = (value) => Number(value || 0).toLocaleString(i18n.language, { style: 'currency', currency: 'EUR' });

  const setResult = (next) => {
    setPreview(next);
    onPreview?.(next);
  };

  const apply = async (value = code) => {
    const trimmed = (value || '').trim();
    setError(null);
    if (!trimmed) { setResult(null); return; }
    setChecking(true);
    try {
      const res = await associago.coupons.validate({ ...target, code: trimmed });
      if (res?.valid) {
        setResult(res);
      } else {
        setResult(null);
        setError(couponErrorMessage(res?.reason, t) || t('couponApply.errors.generic'));
      }
    } catch (e) {
      setResult(null);
      setError(couponErrorMessage(e.message, t) || t('couponApply.errors.generic'));
    } finally {
      setChecking(false);
    }
  };

  // Event price depends on member/guest: refresh an applied preview when the target changes.
  useEffect(() => {
    if (preview) apply();
  }, [targetKey]);

  const clear = () => {
    onCodeChange('');
    setError(null);
    setResult(null);
  };

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={inputId}>{t('couponApply.label')}</label>
      <div className="input-group">
        <input
          id={inputId}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={code}
          autoComplete="off"
          placeholder={t('couponApply.placeholder')}
          aria-describedby={`${inputId}-status`}
          onChange={(e) => {
            onCodeChange(e.target.value);
            if (preview) setResult(null);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); apply(); }
          }}
        />
        <button type="button" className="btn btn-outline-primary" onClick={() => apply()} disabled={checking || !code.trim()}>
          {checking ? t('couponApply.checking') : t('couponApply.apply')}
        </button>
      </div>
      <div id={`${inputId}-status`} aria-live="polite">
        {error && <div className="text-danger small mt-1" role="alert">{error}</div>}
        {!error && !preview && <div className="form-text">{t('couponApply.hint')}</div>}
        {preview && (
          <div
            className="d-flex align-items-start gap-2 mt-2 p-2 border"
            style={{ background: 'var(--surface-muted)', borderRadius: 'var(--card-border-radius)' }}
          >
            <TicketPercent size={18} className="text-success flex-shrink-0 mt-1" aria-hidden="true" />
            <div className="small flex-grow-1">
              <div className="fw-semibold text-success">
                {t('couponApply.applied', { code: preview.code })}
                {' '}({preview.discountType === 'PERCENTAGE' ? `${Number(preview.discountValue)}%` : money(preview.discountValue)})
              </div>
              <div className="text-muted">
                {t('couponApply.price')}: {money(preview.originalAmount)} · {t('couponApply.discount')}: − {money(preview.discount)}
              </div>
              <div className="fw-semibold">{t('couponApply.amountDue')}: {money(preview.finalAmount)}</div>
            </div>
            <button type="button" className="btn btn-sm btn-link text-muted p-0" onClick={clear} aria-label={t('couponApply.remove')} title={t('couponApply.remove')}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponField;

/** Compact marker for a participant registered with a coupon. */
export const CouponBadge = ({ code, discount }) => {
  const { t, i18n } = useTranslation();
  if (!code) return null;
  const amount = Number(discount || 0).toLocaleString(i18n.language, { style: 'currency', currency: 'EUR' });
  const label = t('couponApply.badgeTitle', { code, discount: amount });
  return (
    <span className="badge rounded-pill border border-success text-success bg-transparent ms-2 align-middle" title={label} aria-label={label}>
      <TicketPercent size={12} className="me-1" aria-hidden="true" />{code} −{amount}
    </span>
  );
};
