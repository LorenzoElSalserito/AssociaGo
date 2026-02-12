import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const ActivityInstructorForm = ({ activityId, instructor, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: instructor || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      certifications: '',
      compensation: 0,
      compensationType: 'HOURLY',
      active: true
    }
  });

  const onSubmit = async (data) => {
    try {
      if (instructor?.id) {
        await associago.activities.updateInstructor(instructor.id, data);
      } else {
        await associago.activities.addInstructor(activityId, data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving instructor:', error);
      alert(t('Error saving instructor') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('First Name')}</label>
          <input
            {...register('firstName', { required: t('First Name is required') })}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Last Name')}</label>
          <input
            {...register('lastName', { required: t('Last Name is required') })}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Email')}</label>
          <input
            type="email"
            {...register('email')}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Phone')}</label>
          <input
            type="tel"
            {...register('phone')}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Specialization')}</label>
          <input
            {...register('specialization')}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Certifications')}</label>
          <input
            {...register('certifications')}
            className="form-control"
            placeholder={t('e.g. CONI, FIGC, etc.')}
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Compensation')} (&euro;)</label>
          <input
            type="number"
            step="0.01"
            {...register('compensation')}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Compensation Type')}</label>
          <select {...register('compensationType')} className="form-select">
            <option value="HOURLY">{t('Hourly')}</option>
            <option value="FIXED">{t('Fixed Rate')}</option>
            <option value="PERCENTAGE">{t('Percentage')}</option>
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Save Instructor')}
        </button>
      </div>
    </form>
  );
};

export default ActivityInstructorForm;
