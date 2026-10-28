import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Table, Badge, Spinner, Nav, Form, InputGroup, Alert } from 'react-bootstrap';
import { ArrowLeft, Plus, Trash2, Edit, Users, DollarSign, Calendar, MapPin, Award, Upload, Search, UserCheck, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import CsvImporter from './CsvImporter';
import { CouponBadge } from './CouponField';
import { translateEventType, translateParticipantStatus, translatePaymentStatus, translateCertificateType } from '../utils/enumTranslations';

const EventDetail = ({ eventId, shell, onBack }) => {
    const { t, i18n } = useTranslation();
    const [summary, setSummary] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('participants');
    const [certificateTemplates, setCertificateTemplates] = useState([]);
    const [participantQuery, setParticipantQuery] = useState('');
    const [busyParticipantId, setBusyParticipantId] = useState(null);
    const [participantError, setParticipantError] = useState('');

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sum, parts, templates] = await Promise.all([
                associago.events.getSummary(eventId),
                associago.events.getParticipants(eventId),
                associago.certificates.getTemplates(shell?.currentAssociationId)
            ]);
            setSummary(sum);
            setParticipants(parts);
            setCertificateTemplates(templates || []);
        } catch (error) {
            console.error("Error loading event details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchCertificates = async (templateId) => {
        try {
            await associago.certificates.batchEvent(eventId, templateId, shell.currentAssociationId);
            alert(t('Certificates issued successfully.'));
        } catch (error) {
            alert(error.message);
        }
    };

    const participantName = (p) => p.user ? `${p.user.firstName} ${p.user.lastName}` : (p.guestName || t('Unknown'));

    const filteredParticipants = useMemo(() => {
        const q = participantQuery.trim().toLowerCase();
        if (!q) return participants;
        return participants.filter(p => [p.user?.firstName, p.user?.lastName, p.user?.email, p.guestName, p.guestEmail]
            .filter(Boolean).join(' ').toLowerCase().includes(q));
    }, [participants, participantQuery]);

    const updateParticipant = async (id, action) => {
        setBusyParticipantId(id);
        setParticipantError('');
        try {
            const updated = await action();
            setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
            setSummary(await associago.events.getSummary(eventId));
        } catch (error) {
            console.error('Error updating participant:', error);
            setParticipantError(t('eventCheckIn.error'));
        } finally {
            setBusyParticipantId(null);
        }
    };

    const handleToggleCheckIn = (p) => updateParticipant(p.id, () => p.status === 'CHECKED_IN'
        ? associago.events.undoCheckIn(eventId, p.id)
        : associago.events.checkInParticipant(eventId, p.id));

    const handlePaymentChange = (p, paymentStatus) => updateParticipant(p.id,
        () => associago.events.updateParticipantPayment(eventId, p.id, paymentStatus));

    const participantStatusBg = (status) => ({ CHECKED_IN: 'success', REGISTERED: 'primary', CANCELLED: 'danger', WAITLIST: 'warning', WAITLISTED: 'warning' }[status] || 'secondary');

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
                        <Badge bg="info">{translateEventType(event.type, t)}</Badge>
                        <span className="d-flex align-items-center"><Calendar size={14} className="me-1"/> {new Date(event.startDatetime).toLocaleString(i18n.language)}</span>
                        {event.location && <span className="d-flex align-items-center"><MapPin size={14} className="me-1"/> {event.location}</span>}
                    </div>
                </div>
                <div className="ms-auto">
                    <Button variant="outline-primary" className="me-2" onClick={() => shell.openModal('event-form', { associationId: event.associationId, eventId: event.id, onSuccess: loadData })}>
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
                            <h3 className="fw-bold text-primary mb-0">{(summary.attendanceRate ?? 0).toFixed(1)}%</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Revenue')}</h6>
                            <h3 className="fw-bold text-success mb-0">€ {summary.totalRevenue?.toLocaleString(i18n.language)}</h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
                    <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="participants" className="d-flex align-items-center gap-2"><Users size={18}/> {t('Participants')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="certificates" className="d-flex align-items-center gap-2"><Award size={18}/> {t('Certificates')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="import" className="d-flex align-items-center gap-2"><Upload size={18}/> {t('CSV Import')}</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'participants' && (
                        <div>
                            <div className="p-3 border-bottom d-flex flex-wrap align-items-center gap-2">
                                <InputGroup size="sm" className="flex-grow-1" style={{ maxWidth: '22rem' }}>
                                    <InputGroup.Text><Search size={14} aria-hidden="true"/></InputGroup.Text>
                                    <Form.Control
                                        type="search"
                                        value={participantQuery}
                                        onChange={e => setParticipantQuery(e.target.value)}
                                        placeholder={t('eventCheckIn.search')}
                                        aria-label={t('eventCheckIn.search')}
                                    />
                                </InputGroup>
                                {participantQuery && (
                                    <span className="small text-muted" aria-live="polite">
                                        {t('eventCheckIn.shown', { shown: filteredParticipants.length, total: participants.length })}
                                    </span>
                                )}
                                <Button size="sm" className="ms-auto" onClick={() => shell.openModal('event-participant-form', { eventId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Participant')}
                                </Button>
                            </div>
                            {participantError && (
                                <Alert variant="danger" className="m-3 py-2 small" dismissible onClose={() => setParticipantError('')}>
                                    {participantError}
                                </Alert>
                            )}
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">{t('Name')}</th>
                                        <th>{t('Status')}</th>
                                        <th>{t('eventCheckIn.checkInColumn')}</th>
                                        <th>{t('Payment')}</th>
                                        <th className="text-end pe-4">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredParticipants.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-4">
                                                {participantName(p)}
                                                {p.user && <div className="small text-muted">{p.user.email}</div>}
                                            </td>
                                            <td><Badge bg={participantStatusBg(p.status)}>{translateParticipantStatus(p.status, t)}</Badge></td>
                                            <td>
                                                {(() => {
                                                    const checkedIn = p.status === 'CHECKED_IN';
                                                    const cancelled = p.status === 'CANCELLED';
                                                    return (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant={checkedIn ? 'success' : 'outline-success'}
                                                                className="d-inline-flex align-items-center justify-content-center gap-1"
                                                                style={{ minWidth: '8rem' }}
                                                                aria-pressed={checkedIn}
                                                                aria-label={t('eventCheckIn.checkInLabel', { name: participantName(p) })}
                                                                title={cancelled ? t('eventCheckIn.cancelledHint') : (checkedIn ? t('eventCheckIn.undoLabel', { name: participantName(p) }) : undefined)}
                                                                disabled={cancelled || busyParticipantId === p.id}
                                                                onClick={() => handleToggleCheckIn(p)}
                                                            >
                                                                {checkedIn ? <CheckCircle2 size={14} aria-hidden="true"/> : <UserCheck size={14} aria-hidden="true"/>}
                                                                {checkedIn ? t('eventCheckIn.checkedIn') : t('eventCheckIn.checkIn')}
                                                            </Button>
                                                            <div className="small text-muted mt-1" style={{ minHeight: '1.25rem' }}>
                                                                {p.checkInTime && t('eventCheckIn.checkedInAt', { time: new Date(p.checkInTime).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) })}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Form.Select
                                                        size="sm"
                                                        style={{ width: 'auto', minWidth: '8.5rem' }}
                                                        value={p.paymentStatus || 'PENDING'}
                                                        aria-label={t('eventCheckIn.paymentLabel', { name: participantName(p) })}
                                                        disabled={busyParticipantId === p.id}
                                                        onChange={e => handlePaymentChange(p, e.target.value)}
                                                    >
                                                        {['PENDING', 'PAID', 'WAIVED', 'REFUNDED'].map(s => (
                                                            <option key={s} value={s}>{translatePaymentStatus(s, t)}</option>
                                                        ))}
                                                    </Form.Select>
                                                    {p.amountPaid > 0
                                                        ? <span className="small text-nowrap">€ {p.amountPaid}</span>
                                                        : p.amountDue != null && <span className="small text-nowrap text-muted">€ {p.amountDue}</span>}
                                                    <CouponBadge code={p.couponCode} discount={p.discountAmount} />
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-danger p-0" aria-label={t('eventCheckIn.deleteLabel', { name: participantName(p) })} title={t('eventCheckIn.deleteLabel', { name: participantName(p) })} onClick={() => handleDeleteParticipant(p.id)}><Trash2 size={16} aria-hidden="true"/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {participants.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">{t('No participants')}</td></tr>}
                                    {participants.length > 0 && filteredParticipants.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">{t('eventCheckIn.noMatch')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'certificates' && (
                        <div className="p-3">
                            <Table responsive hover size="sm" className="mb-0">
                                <thead><tr><th>{t('Template')}</th><th>{t('Type')}</th><th className="text-end">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {certificateTemplates.map((template) => (
                                        <tr key={template.id}>
                                            <td>{template.name}</td>
                                            <td>{translateCertificateType(template.type, t)}</td>
                                            <td className="text-end">
                                                <Button size="sm" onClick={() => handleBatchCertificates(template.id)}>
                                                    <Award size={14} className="me-2" />{t('Issue Batch')}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {certificateTemplates.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-muted">{t('No certificate templates available')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'import' && (
                        <div className="p-3">
                            <CsvImporter
                                title={t('Event Participants CSV Import')}
                                onPreview={(file) => associago.csvImport.previewEventParticipants(file, shell.currentAssociationId, eventId)}
                                onConfirm={(importId) => associago.csvImport.confirmImport(importId)}
                            />
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default EventDetail;
