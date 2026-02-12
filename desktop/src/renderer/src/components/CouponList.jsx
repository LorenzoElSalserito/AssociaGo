import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Dropdown } from 'react-bootstrap';
import { Plus, MoreVertical, Edit, Trash2, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import CouponForm from './CouponForm'; // Import the form component

const CouponList = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    useEffect(() => {
        if (associationId) {
            fetchCoupons();
        }
    }, [associationId]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await associago.coupons.getByAssociation(associationId);
            setCoupons(data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure you want to delete this coupon?'))) return;
        try {
            await associago.coupons.delete(id);
            fetchCoupons();
        } catch (error) {
            alert(t('Error deleting coupon'));
        }
    };

    const handleEdit = (coupon) => {
        setSelectedCoupon(coupon);
        setShowForm(true);
    };

    const handleCreate = () => {
        setSelectedCoupon(null);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchCoupons();
    };

    if (showForm) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                    <h5 className="mb-0">{selectedCoupon ? t('Edit Coupon') : t('New Coupon')}</h5>
                </Card.Header>
                <Card.Body>
                    <CouponForm
                        associationId={associationId}
                        coupon={selectedCoupon}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setShowForm(false)}
                    />
                </Card.Body>
            </Card>
        );
    }

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Coupons')}</h2>
                    <p className="text-muted mb-0">{t('Manage discount coupons')}</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center" onClick={handleCreate}>
                    <Plus size={18} className="me-2" />
                    {t('Add Coupon')}
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Code')}</th>
                                    <th className="border-0">{t('Discount')}</th>
                                    <th className="border-0">{t('Validity')}</th>
                                    <th className="border-0">{t('Uses')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.length > 0 ? (
                                    coupons.map(coupon => (
                                        <tr key={coupon.id}>
                                            <td className="ps-4 fw-bold text-primary">
                                                <Tag size={16} className="me-2" />
                                                {coupon.code}
                                            </td>
                                            <td>
                                                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `€${coupon.discountValue}`}
                                                {coupon.minAmount > 0 && <div className="small text-muted">Min: €{coupon.minAmount}</div>}
                                            </td>
                                            <td>
                                                <div className="small text-muted">
                                                    {coupon.startDate} - {coupon.endDate || '∞'}
                                                </div>
                                            </td>
                                            <td>
                                                {coupon.currentUses} / {coupon.maxUses > 0 ? coupon.maxUses : '∞'}
                                            </td>
                                            <td>
                                                <Badge bg={coupon.isActive ? 'success' : 'secondary'} className="fw-normal px-2 py-1">
                                                    {coupon.isActive ? t('Active') : t('Inactive')}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Dropdown align="end">
                                                        <Dropdown.Toggle variant="light" size="sm" className="btn-icon text-muted no-caret">
                                                            <MoreVertical size={16} />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => handleEdit(coupon)}>
                                                                <Edit size={14} className="me-2" /> {t('Edit')}
                                                            </Dropdown.Item>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item className="text-danger" onClick={() => handleDelete(coupon.id)}>
                                                                <Trash2 size={14} className="me-2" /> {t('Delete')}
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            {t('No coupons found.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default CouponList;
