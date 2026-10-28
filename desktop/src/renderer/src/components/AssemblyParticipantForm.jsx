import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';
import { translateVoteError } from '../utils/assemblyVoting';

const AssemblyParticipantForm = ({ assemblyId, participant, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const editing = Boolean(participant?.id);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      memberId: participant?.userAssociationId != null ? String(participant.userAssociationId) : '',
      type: participant?.participationType || 'PRESENT',
      proxyReceiverId: participant?.proxyReceiverId != null ? String(participant.proxyReceiverId) : '',
      role: participant?.role || 'MEMBER',
      notes: participant?.notes || ''
    }
  });
  const [members, setMembers] = useState([]);
  const participationType = watch('type');
  const memberId = watch('memberId');

  useEffect(() => {
    associago.memberships.getByAssociation().then(setMembers).catch(console.error);
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      userAssociationId: data.memberId,
      participationType: data.type,
      proxyReceiverId: data.type === 'PROXY' ? data.proxyReceiverId : null,
      role: data.role,
      notes: data.notes || null
    };
    try {
      if (editing) await associago.assemblies.updateParticipant(participant.id, payload);
      else await associago.assemblies.addParticipant(assemblyId, { ...payload, checkInTime: new Date().toISOString() });
      onSuccess();
    } catch (error) {
      console.error('Error saving participant:', error);
      alert(t('Error adding participant') + ': ' + translateVoteError(t, error.message));
    }
  };

  const memberOptions = (excludeId) => members
    .filter(m => String(m.id) !== String(excludeId || ''))
    .map(m => (
      <option key={m.id} value={m.id}>
        {m.user?.firstName} {m.user?.lastName}
      </option>
    ));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label" htmlFor="participant-memberId">{t('Select Member')}</label>
        <select
          id="participant-memberId"
          aria-invalid={errors.memberId ? 'true' : 'false'}
          {...register('memberId', { required: t('Member is required') })}
          className="form-select"
        >
          <option value="">{t('Select...')}</option>
          {memberOptions()}
        </select>
        {errors.memberId && <span className="text-danger small">{errors.memberId.message}</span>}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="participant-type">{t('Participation Type')}</label>
          <select id="participant-type" {...register('type')} className="form-select">
            <option value="PRESENT">{t('Present')}</option>
            <option value="PROXY">{t('Proxy')}</option>
            <option value="ABSENT">{t('Absent')}</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="participant-role">{t('Role')}</label>
          <select id="participant-role" {...register('role')} className="form-select">
            <option value="MEMBER">{t('Member')}</option>
            <option value="PRESIDENT">{t('President')}</option>
            <option value="SECRETARY">{t('Secretary')}</option>
            <option value="SCRUTINEER">{t('Scrutineer')}</option>
          </select>
        </div>
      </div>

      {participationType === 'PROXY' && (
        <div className="mb-3">
          <label className="form-label" htmlFor="participant-proxyReceiverId">{t('Proxy Receiver')}</label>
          <select id="participant-proxyReceiverId" {...register('proxyReceiverId')} className="form-select">
            <option value="">{t('Select...')}</option>
            {memberOptions(memberId)}
          </select>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label" htmlFor="participant-notes">{t('Notes')}</label>
        <textarea
          id="participant-notes"
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
          {isSubmitting ? t('Saving...') : (editing ? t('Save') : t('Register Presence'))}
        </button>
      </div>
    </form>
  );
};

export default AssemblyParticipantForm;
