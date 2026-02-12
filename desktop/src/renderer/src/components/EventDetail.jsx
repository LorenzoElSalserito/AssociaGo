import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Nav } from 'react-bootstrap';
import { ArrowLeft, Plus, Trash2, Edit, Users, DollarSign, Calendar, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const EventDetail = ({ eventId, shell, onBack }) => {
    const { t } = useTranslation();
    const [summary, setSummary] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('participants');

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sum, parts] = await Promise.all([
                associago.events.getSummary(eventId),
                associago.events.getParticipants(eventId)
            ]);
            setSummary(sum);
            setParticipants(parts);
        } catch (error) {
            console.error("Error loading event details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteParticipant = async (id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            await associago.events.removeParticipant(id);
            loadData();
        } catch (error) {
            alert(t('Error deleting item'));
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;
    if (!summary) return <div className="text-center p-5 text-muted">{t('Event not found')}</div>;

    const { event } = summary;

    return (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="p-0 me-3 text-dark" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h2 className="fw-bold text-dark mb-0">{event.name}</h2>
                    <div className="text-muted small d-flex align-items-center gap-3 mt-1">
                        <Badge bg="info">{event.type}</Badge>
                        <span className="d-flex align-items-center"><Calendar size={14} className="me-1"/> {new Date(event.startDatetime).toLocaleString()}</span>
                        {event.location && <span className="d-flex align-items-center"><MapPin size={14} className="me-1"/> {event.location}</span>}
                    </div>
                </div>
                <div className="ms-auto">
                    <Button variant="outline-primary" className="me-2" onClick={() => shell.openModal('event-form', { associationId: event.associationId, event: event, onSuccess: loadData })}>
                        <Edit size={18} className="me-2" /> {t('Edit')}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Registered')}</h6>
                            <h3 className="fw-bold mb-0">{summary.registeredParticipants} <span className="text-muted fs-6">/ {event.maxParticipants || '∞'}</span></h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Checked In')}</h6>
                            <h3 className="fw-bold mb-0">{summary.checkedInParticipants}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Attendance Rate')}</h6>
                            <h3 className="fw-bold text-primary mb-0">{summary.attendanceRate?.toFixed(1)}%</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Revenue')}</h6>
                            <h3 className="fw-bold text-success mb-0">€ {summary.totalRevenue?.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
                    <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="participants" className="d-flex align-items-center gap-2"><Users size={18}/> {t('Participants')}</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'participants' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('event-participant-form', { eventId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Participant')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">{t('Name')}</th>
                                        <th>{t('Status')}</th>
                                        <th>{t('Payment')}</th>
                                        <th className="text-end pe-4">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-4">
                                                {p.user ? `${p.user.firstName} ${p.user.lastName}` : (p.guestName || t('Unknown'))}
                                                {p.user && <div className="small text-muted">{p.user.email}</div>}
                                            </td>
                                            <td><Badge bg={p.status === 'REGISTERED' ? 'success' : 'secondary'}>{p.status}</Badge></td>
                                            <td>
                                                <Badge bg={p.paymentStatus === 'PAID' ? 'success' : 'warning'} text="dark" className="border">
                                                    {p.paymentStatus}
                                                </Badge>
                                                {p.amountPaid > 0 && <span className="ms-2 small">€ {p.amountPaid}</span>}
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteParticipant(p.id)}><Trash2 size={16}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {participants.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">{t('No participants')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default EventDetail;
