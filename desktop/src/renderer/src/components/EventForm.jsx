import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const EventForm = ({ associationId, eventId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const isEditMode = !!eventId;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: 'MEETING',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      address: '',
      maxParticipants: '',
      costMember: '',
      costNonMember: '',
      isPublic: false,
      status: 'PLANNED',
      requireRegistration: true,
      generateInvoice: false
    }
  });

  useEffect(() => {
    if (isEditMode) {
      associago.events.getById(eventId).then(data => {
        const start = data.startDatetime ? new Date(data.startDatetime) : null;
        const end = data.endDatetime ? new Date(data.endDatetime) : null;
        reset({
          name: data.name || '',
          description: data.description || '',
          type: data.type || 'MEETING',
          startDate: start ? start.toISOString().split('T')[0] : '',
          startTime: start ? start.toTimeString().slice(0, 5) : '',
          endDate: end ? end.toISOString().split('T')[0] : '',
          endTime: end ? end.toTimeString().slice(0, 5) : '',
          location: data.location || '',
          address: data.address || '',
          maxParticipants: data.maxParticipants ?? '',
          costMember: data.costMember ?? '',
          costNonMember: data.costNonMember ?? '',
          isPublic: data.public ?? data.isPublic ?? false,
          status: data.status || 'PLANNED',
          requireRegistration: data.requireRegistration ?? true,
          generateInvoice: data.generateInvoice ?? false
        });
      }).catch(err => console.error('Error loading event:', err));
    }
  }, [eventId, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        associationId: associationId,
        name: data.name,
        description: data.description,
        type: data.type,
        startDatetime: `${data.startDate}T${data.startTime || '00:00:00'}`,
        endDatetime: data.endDate ? `${data.endDate}T${data.endTime || '00:00:00'}` : null,
        location: data.location,
        address: data.address,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
        costMember: data.costMember ? parseFloat(data.costMember) : 0,
        costNonMember: data.costNonMember ? parseFloat(data.costNonMember) : 0,
        public: data.isPublic,
        status: data.status,
        requireRegistration: data.requireRegistration,
        generateInvoice: data.generateInvoice
      };

      if (isEditMode) {
        await associago.events.update(eventId, payload);
      } else {
        await associago.events.create(payload);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(t('Error saving event') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Event Name')}</label>
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
          <label className="form-label">{t('Type')}</label>
          <select
            {...register('type', { required: t('Type is required') })}
            className="form-select"
          >
            <option value="MEETING">{t('Meeting / Assembly')}</option>
            <option value="PARTY">{t('Party')}</option>
            <option value="FUNDRAISER">{t('Fundraiser')}</option>
            <option value="CONGRESS">{t('Congress')}</option>
            <option value="CONFERENCE">{t('Conference')}</option>
            <option value="OTHER">{t('Other')}</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Status')}</label>
          <select
            {...register('status')}
            className="form-select"
          >
            <option value="PLANNED">{t('Planned')}</option>
            <option value="CONFIRMED">{t('Confirmed')}</option>
            <option value="IN_PROGRESS">{t('In Progress')}</option>
            <option value="COMPLETED">{t('Completed')}</option>
            <option value="CANCELLED">{t('Cancelled')}</option>
          </select>
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
          <label className="form-label">{t('Start Time')}</label>
          <input
            type="time"
            {...register('startTime')}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('End Date')}</label>
          <input
            type="date"
            {...register('endDate')}
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
        <div className="col-md-6">
          <label className="form-label">{t('Location')}</label>
          <input
            {...register('location')}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Address')}</label>
          <input
            {...register('address')}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">{t('Max Participants')}</label>
          <input
            type="number"
            {...register('maxParticipants')}
            className="form-control"
            placeholder={t('Unlimited')}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">{t('Member Cost')} (&euro;)</label>
          <input
            type="number"
            step="0.01"
            {...register('costMember')}
            className="form-control"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">{t('Non-Member Cost')} (&euro;)</label>
          <input
            type="number"
            step="0.01"
            {...register('costNonMember')}
            className="form-control"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              {...register('isPublic')}
              className="form-check-input"
              id="isPublic"
            />
            <label className="form-check-label" htmlFor="isPublic">
              {t('Public Event')}
            </label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              {...register('requireRegistration')}
              className="form-check-input"
              id="requireRegistration"
            />
            <label className="form-check-label" htmlFor="requireRegistration">
              {t('Require Registration')}
            </label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              {...register('generateInvoice')}
              className="form-check-input"
              id="generateInvoice"
            />
            <label className="form-check-label" htmlFor="generateInvoice">
              {t('Generate Invoice')}
            </label>
          </div>
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
          {isSubmitting ? t('Saving...') : (isEditMode ? t('Update Event') : t('Save Event'))}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
