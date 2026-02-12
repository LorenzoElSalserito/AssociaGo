import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const PaymentMethodForm = ({ associationId, method, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: method || {
      name: '',
      type: 'OTHER',
      isActive: true,
      hasCommission: false,
      fixedCommission: 0,
      percentageCommission: 0
    }
  });

  const hasCommission = watch('hasCommission');

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        associationId: associationId,
        fixedCommission: parseFloat(data.fixedCommission || 0),
        percentageCommission: parseFloat(data.percentageCommission || 0)
      };

      if (method?.id) {
        await associago.paymentMethods.update(method.id, payload);
      } else {
        await associago.paymentMethods.create(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert(t('Error saving payment method') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Method Name')}</label>
        <input
          {...register('name', { required: t('Name is required') })}
          className="form-control"
          placeholder="e.g. PayPal, Stripe, Bonifico"
        />
        {errors.name && <span className="text-danger small">{errors.name.message}</span>}
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Type')}</label>
        <select {...register('type')} className="form-select">
          <option value="CASH">{t('Cash')}</option>
          <option value="BANK_TRANSFER">{t('Bank Transfer')}</option>
          <option value="ONLINE">{t('Online Payment')}</option>
          <option value="OTHER">{t('Other')}</option>
        </select>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="isActive"
          {...register('isActive')}
        />
        <label className="form-check-label" htmlFor="isActive">{t('Active')}</label>
      </div>

      <hr />

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="hasCommission"
          {...register('hasCommission')}
        />
        <label className="form-check-label fw-bold" htmlFor="hasCommission">{t('Apply Commission')}</label>
      </div>

      {hasCommission && (
        <div className="row g-3 mb-3 bg-light p-3 rounded border">
          <div className="col-md-6">
            <label className="form-label">{t('Fixed Commission (€)')}</label>
            <input
              type="number"
              step="0.01"
              {...register('fixedCommission')}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('Percentage Commission (%)')}</label>
            <input
              type="number"
              step="0.01"
              {...register('percentageCommission')}
              className="form-control"
            />
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Save Method')}
        </button>
      </div>
    </form>
  );
};

export default PaymentMethodForm;
