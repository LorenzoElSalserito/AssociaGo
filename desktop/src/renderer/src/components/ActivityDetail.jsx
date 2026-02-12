import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Nav, Spinner, Dropdown } from 'react-bootstrap';
import { ArrowLeft, Plus, Trash2, Edit, MoreVertical, DollarSign, Users, Clock, User, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const ActivityDetail = ({ activityId, shell, onBack }) => {
    const { t } = useTranslation();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('participants');

    // Sub-resources data
    const [participants, setParticipants] = useState([]);
    const [costs, setCosts] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        loadData();
    }, [activityId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [d, p, c, i, s] = await Promise.all([
                associago.activities.getDetails(activityId),
                associago.activities.getParticipants(activityId),
                associago.activities.getCosts(activityId),
                associago.activities.getInstructors(activityId),
                associago.activities.getSchedules(activityId)
            ]);
            setDetails(d);
            setParticipants(p);
            setCosts(c);
            setInstructors(i);
            setSchedules(s);
        } catch (error) {
            console.error("Error loading activity details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubResource = async (type, id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            if (type === 'cost') await associago.activities.deleteCost(id);
            if (type === 'instructor') await associago.activities.deleteInstructor(id);
            if (type === 'schedule') await associago.activities.deleteSchedule(id);
            if (type === 'participant') await associago.activities.removeParticipant(id);
            loadData();
        } catch (error) {
            alert(t('Error deleting item'));
        }
    };

    const handleDownloadReport = async () => {
        try {
            const blob = await associago.reports.downloadActivityReport(activityId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity_report_${activityId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            alert(t('Error downloading report'));
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;
    if (!details) return <div className="text-center p-5 text-muted">{t('Activity not found')}</div>;

    const { activity } = details;

    return (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="p-0 me-3 text-dark" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h2 className="fw-bold text-dark mb-0">{activity.name}</h2>
                    <div className="text-muted small">
                        <Badge bg="info" className="me-2">{activity.category}</Badge>
                        {new Date(activity.startDate).toLocaleDateString()} - {activity.endDate ? new Date(activity.endDate).toLocaleDateString() : t('Ongoing')}
                    </div>
                </div>
                <div className="ms-auto d-flex gap-2">
                    <Button variant="outline-secondary" onClick={handleDownloadReport}>
                        <Download size={18} className="me-2" /> {t('Report')}
                    </Button>
                    <Button variant="outline-primary" onClick={() => shell.openModal('activity-form', { associationId: activity.associationId, activity: activity, onSuccess: loadData })}>
                        <Edit size={18} className="me-2" /> {t('Edit')}
                    </Button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Participants')}</h6>
                            <h3 className="fw-bold mb-0">{details.activeParticipants} <span className="text-muted fs-6">/ {activity.maxParticipants || '∞'}</span></h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Revenue')}</h6>
                            <h3 className="fw-bold text-success mb-0">€ {details.totalRevenue?.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Costs')}</h6>
                            <h3 className="fw-bold text-danger mb-0">€ {details.totalCosts?.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Net Profit')}</h6>
                            <h3 className={`fw-bold mb-0 ${details.netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
                                € {details.netProfit?.toLocaleString()}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
                    <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="participants" className="d-flex align-items-center gap-2"><Users size={18}/> {t('Participants')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="schedules" className="d-flex align-items-center gap-2"><Clock size={18}/> {t('Schedule')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="instructors" className="d-flex align-items-center gap-2"><User size={18}/> {t('Instructors')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="costs" className="d-flex align-items-center gap-2"><DollarSign size={18}/> {t('Costs')}</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'participants' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('activity-participant-form', { activityId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Participant')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light"><tr><th className="ps-4">{t('Name')}</th><th>{t('Payment')}</th><th>{t('Status')}</th><th className="text-end pe-4">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {participants.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-4">
                                                {p.user ? `${p.user.firstName} ${p.user.lastName}` : `#${p.id}`}
                                            </td>
                                            <td>
                                                <Badge bg={p.isPaid ? 'success' : 'warning'} text={p.isPaid ? 'white' : 'dark'}>
                                                    {p.isPaid ? t('Paid') : t('Pending')}
                                                </Badge>
                                                {p.amountPaid > 0 && <span className="ms-2 small text-muted">€ {p.amountPaid}</span>}
                                            </td>
                                            <td><Badge bg={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge></td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteSubResource('participant', p.id)}><Trash2 size={16}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {participants.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">{t('No participants')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'schedules' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('activity-schedule-form', { activityId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Schedule')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light"><tr><th className="ps-4">{t('Day')}</th><th>{t('Time')}</th><th>{t('Location')}</th><th className="text-end pe-4">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {schedules.map(s => (
                                        <tr key={s.id}>
                                            <td className="ps-4">{t('Day ' + s.dayOfWeek)}</td>
                                            <td>{s.startTime} - {s.endTime}</td>
                                            <td>{s.location || '-'}</td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-muted p-0 me-2" onClick={() => shell.openModal('activity-schedule-form', { activityId, schedule: s, onSuccess: loadData })}><Edit size={16}/></Button>
                                                <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteSubResource('schedule', s.id)}><Trash2 size={16}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {schedules.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">{t('No schedules')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'instructors' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('activity-instructor-form', { activityId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Instructor')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light"><tr><th className="ps-4">{t('Name')}</th><th>{t('Role')}</th><th>{t('Compensation')}</th><th className="text-end pe-4">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {instructors.map(i => (
                                        <tr key={i.id}>
                                            <td className="ps-4">{i.firstName} {i.lastName}</td>
                                            <td>{i.specialization}</td>
                                            <td>€ {i.compensation} ({i.compensationType})</td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-muted p-0 me-2" onClick={() => shell.openModal('activity-instructor-form', { activityId, instructor: i, onSuccess: loadData })}><Edit size={16}/></Button>
                                                <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteSubResource('instructor', i.id)}><Trash2 size={16}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {instructors.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">{t('No instructors')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'costs' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('activity-cost-form', { activityId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Cost')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light"><tr><th className="ps-4">{t('Description')}</th><th>{t('Category')}</th><th>{t('Amount')}</th><th className="text-end pe-4">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {costs.map(c => (
                                        <tr key={c.id}>
                                            <td className="ps-4">{c.description} <small className="text-muted d-block">{new Date(c.date).toLocaleDateString()}</small></td>
                                            <td><Badge bg="light" text="dark" className="border">{c.category}</Badge></td>
                                            <td className="text-danger">-€ {c.amount}</td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-muted p-0 me-2" onClick={() => shell.openModal('activity-cost-form', { activityId, cost: c, onSuccess: loadData })}><Edit size={16}/></Button>
                                                <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteSubResource('cost', c.id)}><Trash2 size={16}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {costs.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">{t('No costs')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default ActivityDetail;
