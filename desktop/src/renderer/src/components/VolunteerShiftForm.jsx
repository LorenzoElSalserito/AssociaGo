import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const VolunteerShiftForm = ({ volunteerId, shift, associationId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: shift || {
      startTime: '',
      endTime: '',
      role: '',
      hoursWorked: 0,
      status: 'SCHEDULED',
      hourlyValue: 0,
      description: '',
      eventId: '',
      activityId: ''
    }
  });

  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    associago.events.getAll().then(setEvents).catch(console.error);
    if (associationId) {
      associago.activities.getAll(associationId).then(setActivities).catch(console.error);
    }
  }, [associationId]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        volunteerId: volunteerId,
        eventId: data.eventId ? parseInt(data.eventId) : null,
        activityId: data.activityId ? parseInt(data.activityId) : null,
        hoursWorked: data.hoursWorked ? parseFloat(data.hoursWorked) : null,
        hourlyValue: data.hourlyValue ? parseFloat(data.hourlyValue) : null
      };

      if (shift?.id) {
        await associago.volunteers.updateShift(shift.id, payload);
      } else {
        await associago.volunteers.createShift(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving shift:', error);
      alert(t('Error saving shift') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Start Time')}</label>
          <input
            type="datetime-local"
            {...register('startTime', { required: t('Start Time is required') })}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('End Time')}</label>
          <input
            type="datetime-local"
            {...register('endTime', { required: t('End Time is required') })}
            className="form-control"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Role')}</label>
        <input
          {...register('role')}
          className="form-control"
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Event (Optional)')}</label>
          <select {...register('eventId')} className="form-select">
            <option value="">{t('None')}</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Activity (Optional)')}</label>
          <select {...register('activityId')} className="form-select">
            <option value="">{t('None')}</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">{t('Hours Worked')}</label>
          <input
            type="number"
            step="0.5"
            {...register('hoursWorked')}
            className="form-control"
          />
        </div>
        <div className="col-md-4">
            <label className="form-label">{t('Hourly Value')} (&euro;)</label>
            <input
                type="number"
                step="0.01"
                {...register('hourlyValue')}
                className="form-control"
            />
        </div>
        <div className="col-md-4">
          <label className="form-label">{t('Status')}</label>
          <select {...register('status')} className="form-select">
            <option value="SCHEDULED">{t('Scheduled')}</option>
            <option value="COMPLETED">{t('Completed')}</option>
            <option value="MISSED">{t('Missed')}</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
          <label className="form-label">{t('Description / Notes')}</label>
          <textarea
              {...register('description')}
              rows="3"
              className="form-control"
          />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Save Shift')}
        </button>
      </div>
    </form>
  );
};

export default VolunteerShiftForm;
