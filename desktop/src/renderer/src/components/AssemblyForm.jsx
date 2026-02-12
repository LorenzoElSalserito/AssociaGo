import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const AssemblyForm = ({ associationId, assemblyId, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    // Use prop id if available (modal mode), otherwise route id (page mode)
    const id = assemblyId || routeId;
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        type: 'ORDINARY',
        status: 'DRAFT',
        president: '',
        secretary: '',
        firstCallQuorum: 50,
        secondCallQuorum: 33,
        notes: ''
    });

    useEffect(() => {
        if (isEditMode) {
            associago.assemblies.getById(id)
                .then(data => {
                    const date = data.date ? new Date(data.date) : null;
                    const formattedDate = date ? date.toISOString().slice(0, 16) : '';
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        date: formattedDate,
                        startTime: data.startTime || '',
                        endTime: data.endTime || '',
                        location: data.location || '',
                        type: data.type || 'ORDINARY',
                        status: data.status || 'DRAFT',
                        president: data.president || '',
                        secretary: data.secretary || '',
                        firstCallQuorum: data.firstCallQuorum ?? 50,
                        secondCallQuorum: data.secondCallQuorum ?? 33,
                        notes: data.notes || ''
                    });
                })
                .catch(err => console.error(err));
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                firstCallQuorum: parseFloat(formData.firstCallQuorum) || 0,
                secondCallQuorum: parseFloat(formData.secondCallQuorum) || 0
            };

            if (isEditMode) {
                await associago.assemblies.update(id, payload);
            } else {
                await associago.assemblies.create({ ...payload, associationId });
            }

            if (onSuccess) onSuccess();
            else navigate('/assemblies');
        } catch (err) {
            console.error(err);
            alert(t('Error saving assembly'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <div className="mb-3">
                <label className="form-label">{t('Title')}</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-control"
                />
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Description')}</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="form-control"
                />
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <label className="form-label">{t('Date')}</label>
                    <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">{t('Start Time')}</label>
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">{t('End Time')}</label>
                    <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Location')}</label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-control"
                />
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label className="form-label">{t('Type')}</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="ORDINARY">{t('Ordinary')}</option>
                        <option value="EXTRAORDINARY">{t('Extraordinary')}</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">{t('Status')}</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="DRAFT">{t('Draft')}</option>
                        <option value="CALLED">{t('Called')}</option>
                        <option value="IN_PROGRESS">{t('In Progress')}</option>
                        <option value="CLOSED">{t('Closed')}</option>
                        <option value="CANCELLED">{t('Cancelled')}</option>
                    </select>
                </div>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label className="form-label">{t('President')}</label>
                    <input
                        type="text"
                        name="president"
                        value={formData.president}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={t('Assembly president')}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">{t('Secretary')}</label>
                    <input
                        type="text"
                        name="secretary"
                        value={formData.secretary}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={t('Assembly secretary')}
                    />
                </div>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label className="form-label">{t('First Call Quorum')} (%)</label>
                    <input
                        type="number"
                        name="firstCallQuorum"
                        value={formData.firstCallQuorum}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="form-control"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">{t('Second Call Quorum')} (%)</label>
                    <input
                        type="number"
                        name="secondCallQuorum"
                        value={formData.secondCallQuorum}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="form-control"
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Notes')}</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="form-control"
                />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                    type="button"
                    onClick={onCancel || (() => navigate('/assemblies'))}
                    className="btn btn-secondary"
                >
                    {t('Cancel')}
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    {isEditMode ? t('Update') : t('Create')}
                </button>
            </div>
        </form>
    );
};

export default AssemblyForm;
