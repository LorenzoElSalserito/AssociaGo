import React from 'react';
import { useForm } from 'react-hook-form';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';

const AssemblyDocumentForm = ({ assemblyId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      type: 'ATTACHMENT',
      description: '',
      isMandatory: false
    }
  });

  const onSubmit = async (data) => {
    try {
      await associago.assemblies.addDocument(assemblyId, {
        name: data.name,
        type: data.type,
        description: data.description,
        isMandatory: data.isMandatory,
        filePath: 'pending-upload'
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding document:', error);
      alert(t('Error adding document') + ': ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      <div className="mb-3">
        <label className="form-label">{t('Document Name')}</label>
        <input
          {...register('name', { required: t('Name is required') })}
          className="form-control"
        />
        {errors.name && <span className="text-danger small">{errors.name.message}</span>}
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Document Type')}</label>
        <select {...register('type')} className="form-select">
          <option value="MINUTES">{t('Minutes')}</option>
          <option value="CALL">{t('Call Notice')}</option>
          <option value="ATTACHMENT">{t('Attachment')}</option>
          <option value="BUDGET">{t('Budget')}</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">{t('Description')}</label>
        <textarea
          {...register('description')}
          rows="2"
          className="form-control"
        />
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          {...register('isMandatory')}
          className="form-check-input"
          id="isMandatory"
        />
        <label className="form-check-label" htmlFor="isMandatory">
          {t('Mandatory Document')}
        </label>
      </div>

      <div className="mb-3">
        <label className="form-label">{t('File')}</label>
        <input
          type="file"
          className="form-control"
          disabled
        />
        <div className="form-text text-muted">{t('File upload will be available in a future update')}</div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? t('Saving...') : t('Add Document')}
        </button>
      </div>
    </form>
  );
};

export default AssemblyDocumentForm;
