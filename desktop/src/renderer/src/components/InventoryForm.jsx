import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const InventoryForm = ({ associationId, itemId, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    // Use prop id if available (modal mode), otherwise route id (page mode)
    const id = itemId || routeId;
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        inventoryCode: '',
        category: '',
        quantity: 1,
        location: '',
        acquisitionMethod: 'PURCHASE',
        purchaseDate: '',
        purchasePrice: 0,
        currentValue: '',
        depreciationYears: '',
        condition: 'NEW',
        status: 'AVAILABLE',
        assignedTo: '',
        notes: ''
    });

    useEffect(() => {
        if (isEditMode) {
            associago.inventory.getById(id)
                .then(data => {
                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        inventoryCode: data.inventoryCode || '',
                        category: data.category || '',
                        quantity: data.quantity ?? 1,
                        location: data.location || '',
                        acquisitionMethod: data.acquisitionMethod || 'PURCHASE',
                        purchaseDate: data.purchaseDate || '',
                        purchasePrice: data.purchasePrice ?? 0,
                        currentValue: data.currentValue ?? '',
                        depreciationYears: data.depreciationYears ?? '',
                        condition: data.condition || 'NEW',
                        status: data.status || 'AVAILABLE',
                        assignedTo: data.assignedTo ?? '',
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
                quantity: parseInt(formData.quantity) || 1,
                purchasePrice: formData.acquisitionMethod === 'PURCHASE' ? parseFloat(formData.purchasePrice) || 0 : null,
                currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
                depreciationYears: formData.depreciationYears ? parseInt(formData.depreciationYears) : null,
                assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null
            };

            if (isEditMode) {
                await associago.inventory.update(id, payload);
            } else {
                await associago.inventory.create({ ...payload, associationId });
            }

            if (onSuccess) onSuccess();
            else navigate('/inventory');
        } catch (err) {
            console.error(err);
            alert(t('Error saving item'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <div className="row g-3 mb-3">
                <div className="col-md-8">
                    <label className="form-label">{t('Item Name')}</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">{t('Inventory Code')}</label>
                    <input
                        type="text"
                        name="inventoryCode"
                        value={formData.inventoryCode}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={t('e.g. INV-001')}
                    />
                </div>
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
                    <label className="form-label">{t('Category')}</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">{t('Quantity')}</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">{t('Location')}</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label className="form-label">{t('Acquisition Method')}</label>
                    <select
                        name="acquisitionMethod"
                        value={formData.acquisitionMethod}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="PURCHASE">{t('Purchase')}</option>
                        <option value="DONATION">{t('Donation')}</option>
                        <option value="LOAN">{t('Loan')}</option>
                        <option value="UNKNOWN">{t('Unknown')}</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">{t('Assigned To (User ID)')}</label>
                    <input
                        type="number"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={t('Optional')}
                    />
                </div>
            </div>

            {formData.acquisitionMethod === 'PURCHASE' && (
                <div className="row g-3 mb-3 bg-light p-3 rounded mx-0">
                    <div className="col-md-6">
                        <label className="form-label">{t('Purchase Price')} (&euro;)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="purchasePrice"
                            value={formData.purchasePrice}
                            onChange={handleChange}
                            className="form-control"
                        />
                        {!isEditMode && (
                            <div className="form-text text-success">
                                <i className="bi bi-info-circle"></i> {t('A transaction will be automatically created.')}
                            </div>
                        )}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">{t('Purchase Date')}</label>
                        <input
                            type="date"
                            name="purchaseDate"
                            value={formData.purchaseDate}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
            )}

            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <label className="form-label">{t('Current Value')} (&euro;)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="currentValue"
                        value={formData.currentValue}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={t('Optional')}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">{t('Depreciation Years')}</label>
                    <input
                        type="number"
                        name="depreciationYears"
                        value={formData.depreciationYears}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={t('Optional')}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">{t('Condition')}</label>
                    <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="NEW">{t('New')}</option>
                        <option value="GOOD">{t('Good')}</option>
                        <option value="FAIR">{t('Fair')}</option>
                        <option value="POOR">{t('Poor')}</option>
                        <option value="BROKEN">{t('Broken')}</option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">{t('Status')}</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="AVAILABLE">{t('Available')}</option>
                    <option value="IN_USE">{t('In Use')}</option>
                    <option value="LOANED">{t('Loaned')}</option>
                    <option value="LOST">{t('Lost')}</option>
                    <option value="DISPOSED">{t('Disposed')}</option>
                </select>
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
                    onClick={onCancel || (() => navigate('/inventory'))}
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

export default InventoryForm;
