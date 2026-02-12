import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner, Nav } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Calendar, Users, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import ActivityDetail from './ActivityDetail';
import CouponList from './CouponList';

const ActivityList = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedActivityId, setSelectedActivityId] = useState(null);
    const [activeTab, setActiveTab] = useState('activities');

    useEffect(() => {
        if (associationId && activeTab === 'activities') {
            fetchActivities();
        }
    }, [associationId, activeTab]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await associago.activities.getAll(associationId);
            setActivities(data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure you want to delete this activity?'))) return;
        try {
            await associago.activities.delete(id);
            fetchActivities();
        } catch (error) {
            alert(t('Error deleting activity'));
        }
    };

    const filteredActivities = activities.filter(activity =>
        activity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDER DETAIL VIEW ---
    if (selectedActivityId) {
        return (
            <ActivityDetail
                activityId={selectedActivityId}
                shell={shell}
                onBack={() => {
                    setSelectedActivityId(null);
                    fetchActivities(); // Refresh list on back
                }}
            />
        );
    }

    const renderHeader = () => (
        <div className="mb-4">
             <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Activities & Coupons')}</h2>
                    <p className="text-muted mb-0">{t('Manage courses, activities and discounts')}</p>
                </div>
             </div>
             <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                    <Nav.Link eventKey="activities" className="px-4">{t('Activities')}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="coupons" className="px-4">{t('Coupons')}</Nav.Link>
                </Nav.Item>
             </Nav>
        </div>
    );

    if (activeTab === 'coupons') {
        return (
            <div className="fade-in">
                {renderHeader()}
                <CouponList associationId={associationId} shell={shell} />
            </div>
        );
    }

    // --- RENDER LIST VIEW (ACTIVITIES) ---
    return (
        <div className="fade-in">
            {renderHeader()}

            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" className="d-flex align-items-center" onClick={() => shell.openModal('activity-form', { associationId, onSuccess: fetchActivities })}>
                    <Plus size={18} className="me-2" />
                    {t('Add Activity')}
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-2" style={{ width: '300px' }}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <Search size={16} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder={t('Search activities...')}
                                    className="bg-light border-start-0 ps-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Name')}</th>
                                    <th className="border-0">{t('Schedule')}</th>
                                    <th className="border-0">{t('Participants')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredActivities.length > 0 ? (
                                    filteredActivities.map(activity => (
                                        <tr key={activity.id} style={{cursor: 'pointer'}} onClick={() => setSelectedActivityId(activity.id)}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{activity.name}</div>
                                                        <div className="small text-muted">{activity.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-muted small">
                                                    {activity.startDate} {activity.endDate ? `- ${activity.endDate}` : ''}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <Users size={14} className="me-1" />
                                                    {activity.maxParticipants ? `${activity.maxParticipants} max` : 'Unlimited'}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={activity.active ? "success" : "secondary"} className="fw-normal px-2 py-1">
                                                    {activity.active ? t('Active') : t('Archived')}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" size="sm" className="btn-icon text-primary" onClick={() => setSelectedActivityId(activity.id)}>
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-muted" onClick={() => shell.openModal('activity-form', { associationId, activityId: activity.id, onSuccess: fetchActivities })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-danger" onClick={() => handleDelete(activity.id)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            {t('No activities found.')}
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

export default ActivityList;
