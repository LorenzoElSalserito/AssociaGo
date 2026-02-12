import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const VolunteerForm = ({ associationId, volunteerId, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    // Use prop id if available (modal mode), otherwise route id (page mode)
    const id = volunteerId || routeId;
    const isEditMode = !!id;

    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        memberId: '',
        skills: '',
        availability: '',
        status: 'ACTIVE',
        notes: ''
    });

    useEffect(() => {
        associago.members.getAll().then(setMembers).catch(console.error);
    }, []);

    useEffect(() => {
        if (isEditMode) {
            associago.volunteers.getById(id)
                .then(data => {
                    setFormData({
                        memberId: data.memberId ?? '',
                        skills: data.skills || '',
                        availability: data.availability || '',
                        status: data.status || 'ACTIVE',
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
                memberId: formData.memberId ? parseInt(formData.memberId) : null
            };

            if (isEditMode) {
                await associago.volunteers.update(id, payload);
            } else {
                await associago.volunteers.create({ ...payload, associationId });
            }

            if (onSuccess) onSuccess();
            else navigate('/volunteers');
        } catch (err) {
            console.error(err);
            alert(t('Error saving volunteer'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <div className="mb-3">
                <label className="form-label">{t('Member')}</label>
                <select
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    required
                    className="form-select"
                >
                    <option value="">{t('Select a member...')}</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Skills')}</label>
                <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="form-control"
                    placeholder={t('e.g. First aid, Logistics, Communication')}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Availability')}</label>
                <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="form-control"
                    placeholder={t('e.g. Weekends, Evenings')}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Status')}</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="ACTIVE">{t('Active')}</option>
                    <option value="INACTIVE">{t('Inactive')}</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Notes')}</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="form-control"
                />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                    type="button"
                    onClick={onCancel || (() => navigate('/volunteers'))}
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

export default VolunteerForm;
