import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const AssemblyMotionForm = ({ assemblyId, motion, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: motion || {
      title: '',
      description: '',
      votingType: 'SIMPLE',
      orderNumber: 1,
      isPlanned: true,
      notes: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        orderNumber: parseInt(data.orderNumber) || 1,
        isPlanned: data.isPlanned
      };

      await associago.assemblies.addMotion(assemblyId, payload);
      onSuccess();
    } catch (error) {
      console.error('Error saving motion:', error);
      alert(t('Error saving motion') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Title')}</label>
        <input
          {...register('title', { required: t('Title is required') })}
          className="form-control"
        />
        {errors.title && <span className="text-danger small">{errors.title.message}</span>}
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Description')}</label>
        <textarea
          {...register('description')}
          rows="3"
          className="form-control"
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Voting Type')}</label>
          <select {...register('votingType')} className="form-select">
            <option value="SIMPLE">{t('Simple Majority')}</option>
            <option value="QUALIFIED">{t('Qualified Majority')}</option>
            <option value="UNANIMITY">{t('Unanimity')}</option>
            <option value="CONSULTATIVE">{t('Consultative')}</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Order Number')}</label>
          <input
            type="number"
            {...register('orderNumber')}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          {...register('isPlanned')}
          className="form-check-input"
          id="isPlanned"
        />
        <label className="form-check-label" htmlFor="isPlanned">
          {t('Planned (on agenda)')}
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
          {isSubmitting ? t('Saving...') : t('Save Motion')}
        </button>
      </div>
    </form>
  );
};

export default AssemblyMotionForm;
