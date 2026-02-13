import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const CouponForm = ({ associationId, coupon, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: coupon || {
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      maxUses: 0,
      minAmount: 0,
      isActive: true
    }
  });

  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    associago.activities.getAll(associationId)
      .then(setActivities)
      .catch(err => console.error("Failed to load activities", err));
    associago.events.getAll()
      .then(setEvents)
      .catch(err => console.error("Failed to load events", err));
  }, [associationId]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        associationId: associationId,
        discountValue: parseFloat(data.discountValue),
        minAmount: parseFloat(data.minAmount),
        maxUses: parseInt(data.maxUses),
        applicableActivities: data.applicableActivities
          ? data.applicableActivities.map(id => ({ id: parseInt(id) }))
          : [],
        applicableEvents: data.applicableEvents
          ? data.applicableEvents.map(id => ({ id: parseInt(id) }))
          : []
      };

      if (coupon?.id) {
        await associago.coupons.update(coupon.id, payload);
      } else {
        await associago.coupons.create(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(t('Error saving coupon') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Coupon Code')}</label>
        <input {...register('code', { required: true })} className="form-control" />
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Description')}</label>
        <input {...register('description')} className="form-control" />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Discount Type')}</label>
          <select {...register('discountType')} className="form-select">
            <option value="PERCENTAGE">{t('Percentage')}</option>
            <option value="FIXED_AMOUNT">{t('Fixed Amount')}</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Discount Value')}</label>
          <input type="number" step="0.01" {...register('discountValue', { required: true })} className="form-control" />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Start Date')}</label>
          <input type="date" {...register('startDate')} className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('End Date')}</label>
          <input type="date" {...register('endDate')} className="form-control" />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Max Uses (0 for unlimited)')}</label>
          <input type="number" {...register('maxUses')} className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Minimum Amount')}</label>
          <input type="number" step="0.01" {...register('minAmount')} className="form-control" />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Applicable Activities (leave empty for all)')}</label>
        <select multiple {...register('applicableActivities')} className="form-select" style={{ height: '150px' }}>
          {activities.map(act => (
            <option key={act.id} value={act.id}>{act.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Applicable Events (leave empty for all)')}</label>
        <select multiple {...register('applicableEvents')} className="form-select" style={{ height: '150px' }}>
          {events.map(evt => (
            <option key={evt.id} value={evt.id}>{evt.name}</option>
          ))}
        </select>
      </div>

      <div className="form-check mb-3">
        <input type="checkbox" {...register('isActive')} className="form-check-input" id="coupon-active" />
        <label className="form-check-label" htmlFor="coupon-active">{t('Active')}</label>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">{t('Cancel')}</button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Save Coupon')}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
