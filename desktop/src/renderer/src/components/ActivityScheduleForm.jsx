import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const ActivityScheduleForm = ({ activityId, schedule, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: schedule || {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      active: true
    }
  });

  const onSubmit = async (data) => {
    try {
      if (schedule?.id) {
        await associago.activities.updateSchedule(schedule.id, data);
      } else {
        await associago.activities.addSchedule(activityId, data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(t('Error saving schedule') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Day of Week')}</label>
        <select {...register('dayOfWeek')} className="form-select">
          <option value="1">{t('Monday')}</option>
          <option value="2">{t('Tuesday')}</option>
          <option value="3">{t('Wednesday')}</option>
          <option value="4">{t('Thursday')}</option>
          <option value="5">{t('Friday')}</option>
          <option value="6">{t('Saturday')}</option>
          <option value="7">{t('Sunday')}</option>
        </select>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Start Time')}</label>
          <input
            type="time"
            {...register('startTime', { required: true })}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('End Time')}</label>
          <input
            type="time"
            {...register('endTime', { required: true })}
            className="form-control"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Location')}</label>
        <input
          {...register('location')}
          className="form-control"
          placeholder={t('Optional')}
        />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Save Schedule')}
        </button>
      </div>
    </form>
  );
};

export default ActivityScheduleForm;
