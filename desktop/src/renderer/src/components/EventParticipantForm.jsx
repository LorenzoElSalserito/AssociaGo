import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-bootstrap';

const EventParticipantForm = ({ eventId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [members, setMembers] = useState([]);
  const type = watch('type', 'MEMBER');

  useEffect(() => {
    associago.memberships.getByAssociation().then(setMembers).catch(console.error);
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        status: 'REGISTERED',
        paymentStatus: 'PENDING',
        registrationDate: new Date().toISOString()
      };

      if (data.type === 'MEMBER') {
          payload.user = { id: data.userId };
      } else {
          payload.guestName = data.guestName;
          payload.guestEmail = data.guestEmail;
      }

      await associago.events.addParticipant(eventId, payload);
      onSuccess();
    } catch (error) {
      console.error('Error adding participant:', error);
      alert(t('Error adding participant') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Participant Type')}</label>
        <div className="d-flex gap-3">
            <Form.Check
                type="radio"
                label={t('Member')}
                value="MEMBER"
                {...register('type')}
                defaultChecked
            />
            <Form.Check
                type="radio"
                label={t('Guest (External)')}
                value="GUEST"
                {...register('type')}
            />
        </div>
      </div>

      {type === 'MEMBER' ? (
          <div className="mb-3">
            <label className="form-label">{t('Select Member')}</label>
            <select
              {...register('userId', { required: type === 'MEMBER' && t('Member is required') })}
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
      ) : (
          <>
              <div className="mb-3">
                <label className="form-label">{t('Guest Name')}</label>
                <input
                  {...register('guestName', { required: type === 'GUEST' && t('Name is required') })}
                  className="form-control"
                />
                {errors.guestName && <span className="text-danger small">{errors.guestName.message}</span>}
              </div>
              <div className="mb-3">
                <label className="form-label">{t('Guest Email')}</label>
                <input
                  type="email"
                  {...register('guestEmail')}
                  className="form-control"
                />
              </div>
          </>
      )}

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

export default EventParticipantForm;
