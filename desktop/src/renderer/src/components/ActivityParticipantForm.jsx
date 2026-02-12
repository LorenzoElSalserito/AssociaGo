import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const ActivityParticipantForm = ({ activityId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    associago.memberships.getByAssociation().then(setMembers).catch(console.error);
  }, []);

  const onSubmit = async (data) => {
    try {
      await associago.activities.addParticipant(activityId, {
        user: { id: data.userId },
        registrationDate: new Date().toISOString().split('T')[0],
        isActive: true
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding participant:', error);
      alert(t('Error adding participant') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Select Member')}</label>
        <select
          {...register('userId', { required: t('Member is required') })}
          className="form-select"
        >
          <option value="">{t('Select...')}</option>
          {members.map(m => (
            <option key={m.id} value={m.user.id}>
              {m.user.firstName} {m.user.lastName} ({m.user.taxCode})
            </option>
          ))}
        </select>
        {errors.userId && <span className="text-danger small">{errors.userId.message}</span>}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Add Participant')}
        </button>
      </div>
    </form>
  );
};

export default ActivityParticipantForm;
