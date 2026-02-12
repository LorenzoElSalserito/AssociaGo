import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const AssemblyParticipantForm = ({ assemblyId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      memberId: '',
      type: 'PRESENT',
      proxyReceiverId: '',
      role: 'MEMBER',
      notes: ''
    }
  });
  const [members, setMembers] = useState([]);
  const participationType = watch('type');

  useEffect(() => {
    associago.members.getAll().then(setMembers).catch(console.error);
  }, []);

  const onSubmit = async (data) => {
    try {
      await associago.assemblies.addParticipant(assemblyId, {
        userAssociationId: data.memberId,
        participationType: data.type,
        proxyReceiverId: data.type === 'PROXY' ? data.proxyReceiverId : null,
        role: data.role,
        notes: data.notes || null,
        checkInTime: new Date().toISOString()
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
          {...register('memberId', { required: t('Member is required') })}
          className="form-select"
        >
          <option value="">{t('Select...')}</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
        {errors.memberId && <span className="text-danger small">{errors.memberId.message}</span>}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">{t('Participation Type')}</label>
          <select {...register('type')} className="form-select">
            <option value="PRESENT">{t('Present')}</option>
            <option value="PROXY">{t('Proxy')}</option>
            <option value="ABSENT">{t('Absent')}</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Role')}</label>
          <select {...register('role')} className="form-select">
            <option value="MEMBER">{t('Member')}</option>
            <option value="PRESIDENT">{t('President')}</option>
            <option value="SECRETARY">{t('Secretary')}</option>
            <option value="SCRUTINEER">{t('Scrutineer')}</option>
          </select>
        </div>
      </div>

      {participationType === 'PROXY' && (
        <div className="mb-3">
          <label className="form-label">{t('Proxy Receiver')}</label>
          <select {...register('proxyReceiverId')} className="form-select">
            <option value="">{t('Select...')}</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

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
          {isSubmitting ? t('Saving...') : t('Register Presence')}
        </button>
      </div>
    </form>
  );
};

export default AssemblyParticipantForm;
