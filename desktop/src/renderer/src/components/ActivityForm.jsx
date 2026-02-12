import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const ActivityForm = ({ associationId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const baseUrl = await associago.getApiUrl();
      const response = await fetch(`${baseUrl}/v1/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          associationId: associationId,
          name: data.name,
          description: data.description,
          category: data.category,
          startDate: data.startDate,
          endDate: data.endDate || null,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          location: data.location,
          maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
          cost: data.cost ? parseFloat(data.cost) : 0,
          active: true,
          // New fields
          subscriptionType: data.subscriptionType,
          scheduleDetails: data.scheduleDetails,
          requireRegistration: data.requireRegistration,
          generateInvoice: data.generateInvoice,
          imagePath: data.imagePath,
          documentPath: data.documentPath
        }),
      });

      if (!response.ok) throw new Error('Failed to create activity');

      onSuccess();
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Activity Name')}</label>
        <input
          {...register('name', { required: t('Name is required') })}
          className="form-control"
        />
        {errors.name && <span className="text-danger small">{errors.name.message}</span>}
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
          <label className="form-label">{t('Category')}</label>
          <select
            {...register('category', { required: t('Category is required') })}
            className="form-select"
          >
            <option value="COURSE">{t('Course')}</option>
            <option value="WORKSHOP">{t('Workshop')}</option>
            <option value="SEMINAR">{t('Seminar')}</option>
            <option value="OTHER">{t('Other')}</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Subscription Type')}</label>
          <select {...register('subscriptionType')} className="form-select" defaultValue="ONE_TIME">
            <option value="ONE_TIME">{t('One Time')}</option>
            <option value="MONTHLY">{t('Monthly')}</option>
            <option value="ANNUAL">{t('Annual')}</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Cost')} (€)</label>
          <input
            type="number"
            step="0.01"
            {...register('cost')}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
            <label className="form-label">{t('Schedule Details')}</label>
            <input
                type="text"
                {...register('scheduleDetails')}
                className="form-control"
                placeholder={t('e.g., Mon/Wed 18-20')}
            />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Start Date')}</label>
          <input
            type="date"
            {...register('startDate', { required: t('Start date is required') })}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('End Date')}</label>
          <input
            type="date"
            {...register('endDate')}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Start Time')}</label>
          <input
            type="time"
            {...register('startTime')}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('End Time')}</label>
          <input
            type="time"
            {...register('endTime')}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-8">
          <label className="form-label">{t('Location')}</label>
          <input
            {...register('location')}
            className="form-control"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">{t('Max Participants')}</label>
          <input
            type="number"
            {...register('maxParticipants')}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
          <div className="col-md-6">
              <label className="form-label">{t('Image Path/URL')}</label>
              <input {...register('imagePath')} className="form-control" />
          </div>
          <div className="col-md-6">
              <label className="form-label">{t('Document Path/URL')}</label>
              <input {...register('documentPath')} className="form-control" />
          </div>
      </div>

      <div className="mb-3">
          <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id="requireRegistration" {...register('requireRegistration')} defaultChecked={true} />
              <label className="form-check-label" htmlFor="requireRegistration">{t('Require Registration')}</label>
          </div>
          <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id="generateInvoice" {...register('generateInvoice')} />
              <label className="form-check-label" htmlFor="generateInvoice">{t('Generate Invoice')}</label>
          </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          {t('Cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? t('Saving...') : t('Save Activity')}
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
