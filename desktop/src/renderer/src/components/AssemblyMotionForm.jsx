import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';
import { translateVoteError } from '../utils/assemblyVoting';

const AssemblyMotionForm = ({ assemblyId, motion, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: motion?.title || '',
      description: motion?.description || '',
      votingType: motion?.votingType || 'SIMPLE',
      orderNumber: motion?.orderNumber ?? 1,
      planned: motion?.planned ?? true,
      notes: motion?.notes || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        votingType: data.votingType,
        orderNumber: parseInt(data.orderNumber) || 1,
        planned: data.planned,
        notes: data.notes
      };

      if (motion?.id) await associago.assemblies.updateMotion(motion.id, payload);
      else await associago.assemblies.addMotion(assemblyId, payload);
      onSuccess();
    } catch (error) {
      console.error('Error saving motion:', error);
      alert(t('Error saving motion') + ': ' + translateVoteError(t, error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label" htmlFor="motion-title">{t('Title')}</label>
        <input
          id="motion-title"
          aria-invalid={errors.title ? 'true' : 'false'}
          {...register('title', { required: t('Title is required') })}
          className="form-control"
        />
        {errors.title && <span className="text-danger small">{errors.title.message}</span>}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="motion-description">{t('Description')}</label>
        <textarea
          id="motion-description"
          {...register('description')}
          rows="3"
          className="form-control"
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="motion-votingType">{t('Voting Type')}</label>
          <select id="motion-votingType" {...register('votingType')} className="form-select">
            <option value="SIMPLE">{t('Simple Majority')}</option>
            <option value="QUALIFIED">{t('Qualified Majority')}</option>
            <option value="UNANIMITY">{t('Unanimity')}</option>
            <option value="CONSULTATIVE">{t('Consultative')}</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="motion-orderNumber">{t('Order Number')}</label>
          <input
            id="motion-orderNumber"
            min="1"
            type="number"
            {...register('orderNumber')}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          {...register('planned')}
          className="form-check-input"
          id="motion-planned"
        />
        <label className="form-check-label" htmlFor="motion-planned">
          {t('Planned (on agenda)')}
        </label>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="motion-notes">{t('Notes')}</label>
        <textarea
          id="motion-notes"
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
