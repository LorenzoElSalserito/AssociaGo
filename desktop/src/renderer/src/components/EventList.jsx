import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner, Nav } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import EventDetail from './EventDetail';
import CouponList from './CouponList';

const EventList = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [activeTab, setActiveTab] = useState('events');

    useEffect(() => {
        if (associationId && activeTab === 'events') {
            fetchEvents();
        }
    }, [associationId, activeTab]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await associago.events.getAll();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure you want to delete this event?'))) return;
        try {
            await associago.events.delete(id);
            fetchEvents();
        } catch (error) {
            alert(t('Error deleting event'));
        }
    };

    const filteredEvents = events.filter(event =>
        event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDER DETAIL VIEW ---
    if (selectedEventId) {
        return (
            <EventDetail
                eventId={selectedEventId}
                shell={shell}
                onBack={() => {
                    setSelectedEventId(null);
                    fetchEvents();
                }}
            />
        );
    }

    const renderHeader = () => (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Events & Coupons')}</h2>
                    <p className="text-muted mb-0">{t('Manage events and discounts')}</p>
                </div>
            </div>
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                    <Nav.Link eventKey="events" className="px-4">{t('Events')}</Nav.Link>
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

    // --- RENDER LIST VIEW ---
    return (
        <div className="fade-in">
            {renderHeader()}

            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" className="d-flex align-items-center" onClick={() => shell.openModal('event-form', { associationId, onSuccess: fetchEvents })}>
                    <Plus size={18} className="me-2" />
                    {t('Add Event')}
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
                                    placeholder={t('Search events...')}
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
                                    <th className="border-0 ps-4">{t('Title')}</th>
                                    <th className="border-0">{t('Date')}</th>
                                    <th className="border-0">{t('Location')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map(event => (
                                        <tr key={event.id} style={{cursor: 'pointer'}} onClick={() => setSelectedEventId(event.id)}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{event.name}</div>
                                                        <div className="small text-muted">{event.type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-muted small">
                                                    {new Date(event.startDatetime).toLocaleDateString()} {new Date(event.startDatetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <MapPin size={14} className="me-1" />
                                                    {event.location || 'TBD'}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={event.status === 'PLANNED' ? 'primary' : 'secondary'} className="fw-normal px-2 py-1">
                                                    {event.status}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" size="sm" className="btn-icon text-primary" onClick={() => setSelectedEventId(event.id)}>
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-muted" onClick={() => shell.openModal('event-form', { associationId, eventId: event.id, onSuccess: fetchEvents })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-danger" onClick={() => handleDelete(event.id)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            {t('No events found.')}
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

export default EventList;
