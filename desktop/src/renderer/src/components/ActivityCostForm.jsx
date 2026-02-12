import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const ActivityCostForm = ({ activityId, cost, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: cost || {
      description: '',
      amount: 0,
      category: 'EQUIPMENT',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
      frequency: 'MONTHLY',
      supplier: '',
      notes: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      if (cost?.id) {
        await associago.activities.updateCost(cost.id, data);
      } else {
        await associago.activities.addCost(activityId, data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving cost:', error);
      alert(t('Error saving cost') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Description')}</label>
        <input
          {...register('description', { required: t('Description is required') })}
          className="form-control"
        />
        {errors.description && <span className="text-danger small">{errors.description.message}</span>}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Amount')} (€)</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { required: t('Amount is required') })}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Category')}</label>
          <select {...register('category')} className="form-select">
            <option value="MATERIALS">{t('Materials')}</option>
            <option value="EQUIPMENT">{t('Equipment')}</option>
            <option value="STAFF">{t('Staff')}</option>
            <option value="RENT">{t('Rent / Venue')}</option>
            <option value="MARKETING">{t('Marketing')}</option>
            <option value="OTHER">{t('Other')}</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Date')}</label>
          <input
            type="date"
            {...register('date', { required: t('Date is required') })}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Supplier')}</label>
          <input
            {...register('supplier')}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          {...register('recurring')}
          className="form-check-input"
          id="recurring"
        />
        <label className="form-check-label" htmlFor="recurring">
          {t('Recurring Cost')}
        </label>
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Notes')}</label>
        <textarea
          {...register('notes')}
          rows="2"
          className="form-control"
        />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Save Cost')}
        </button>
      </div>
    </form>
  );
};

export default ActivityCostForm;
