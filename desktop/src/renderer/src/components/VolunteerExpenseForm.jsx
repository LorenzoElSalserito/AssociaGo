import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const VolunteerExpenseForm = ({ volunteerId, expense, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: expense || {
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      status: 'PENDING'
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        volunteerId: volunteerId,
        amount: parseFloat(data.amount)
      };

      if (expense?.id) {
        // Update logic if needed, currently API only supports status update via specific endpoint
        // Assuming create for now or simple update if implemented
        alert("Update not fully implemented in this MVP form");
      } else {
        await associago.volunteers.createExpense(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert(t('Error saving expense') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Date')}</label>
        <input
          type="date"
          {...register('expenseDate', { required: true })}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Description')}</label>
        <input
          {...register('description', { required: true })}
          className="form-control"
          placeholder={t('e.g. Travel reimbursement')}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Amount')} (&euro;)</label>
        <input
          type="number"
          step="0.01"
          {...register('amount', { required: true, min: 0 })}
          className="form-control"
        />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Save Expense')}
        </button>
      </div>
    </form>
  );
};

export default VolunteerExpenseForm;
