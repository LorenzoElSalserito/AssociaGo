import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Nav, Spinner } from 'react-bootstrap';
import { ArrowLeft, Plus, Edit, Trash2, Clock, DollarSign, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const VolunteerDetail = ({ volunteerId, shell, onBack }) => {
    const { t } = useTranslation();
    const [volunteer, setVolunteer] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('shifts');

    useEffect(() => {
        loadData();
    }, [volunteerId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [v, s, e] = await Promise.all([
                associago.volunteers.getById(volunteerId),
                associago.volunteers.getShiftsByVolunteer(volunteerId),
                associago.volunteers.getExpensesByVolunteer(volunteerId)
            ]);
            setVolunteer(v);
            setShifts(s);
            setExpenses(e);
        } catch (error) {
            console.error("Error loading volunteer details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpenseStatusChange = async (expenseId, newStatus) => {
        try {
            await associago.volunteers.updateExpenseStatus(expenseId, newStatus);
            loadData();
        } catch (error) {
            console.error("Error updating expense status:", error);
            alert(t('Error updating status'));
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;
    if (!volunteer) return <div className="text-center p-5 text-muted">{t('Volunteer not found')}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="p-0 me-3 text-dark" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h2 className="fw-bold text-dark mb-0">{t('Volunteer')} #{volunteer.id}</h2>
                    <div className="text-muted small">
                        {t('Member ID')}: {volunteer.memberId}
                    </div>
                </div>
                <div className="ms-auto">
                    <Button variant="outline-primary" className="me-2" onClick={() => shell.openModal('volunteer-form', { associationId: volunteer.associationId, volunteerId: volunteer.id, onSuccess: loadData })}>
                        <Edit size={18} className="me-2" /> {t('Edit')}
                    </Button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Status')}</h6>
                            <Badge bg={volunteer.status === 'ACTIVE' ? 'success' : 'secondary'} className="fs-6">
                                {t(volunteer.status)}
                            </Badge>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Skills')}</h6>
                            <p className="mb-0">{volunteer.skills || '-'}</p>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Availability')}</h6>
                            <p className="mb-0">{volunteer.availability || '-'}</p>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
                    <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="shifts" className="d-flex align-items-center gap-2"><Clock size={18}/> {t('Shifts')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="expenses" className="d-flex align-items-center gap-2"><DollarSign size={18}/> {t('Expenses')}</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'shifts' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('volunteer-shift-form', { volunteerId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Shift')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">{t('Start Time')}</th>
                                        <th>{t('End Time')}</th>
                                        <th>{t('Role')}</th>
                                        <th>{t('Hours')}</th>
                                        <th>{t('Status')}</th>
                                        <th className="text-end pe-4">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shifts.map(s => (
                                        <tr key={s.id}>
                                            <td className="ps-4">{new Date(s.startTime).toLocaleString()}</td>
                                            <td>{new Date(s.endTime).toLocaleString()}</td>
                                            <td>{s.role}</td>
                                            <td>{s.hoursWorked}</td>
                                            <td><Badge bg="light" text="dark" className="border">{t(s.status)}</Badge></td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-muted p-0 me-2" onClick={() => shell.openModal('volunteer-shift-form', { volunteerId, shift: s, onSuccess: loadData })}><Edit size={16}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {shifts.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">{t('No shifts')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('volunteer-expense-form', { volunteerId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Expense')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">{t('Date')}</th>
                                        <th>{t('Description')}</th>
                                        <th>{t('Amount')}</th>
                                        <th>{t('Status')}</th>
                                        <th className="text-end pe-4">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(e => (
                                        <tr key={e.id}>
                                            <td className="ps-4">{new Date(e.expenseDate).toLocaleDateString()}</td>
                                            <td>{e.description}</td>
                                            <td className="fw-bold">€ {e.amount}</td>
                                            <td>
                                                <Badge bg={
                                                    e.status === 'PAID' ? 'success' :
                                                    e.status === 'APPROVED' ? 'info' :
                                                    e.status === 'REJECTED' ? 'danger' : 'warning'
                                                }>
                                                    {t(e.status)}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                {e.status === 'PENDING' && (
                                                    <>
                                                        <Button variant="link" size="sm" className="text-success p-0 me-2" onClick={() => handleExpenseStatusChange(e.id, 'APPROVED')}>
                                                            {t('Approve')}
                                                        </Button>
                                                        <Button variant="link" size="sm" className="text-danger p-0 me-2" onClick={() => handleExpenseStatusChange(e.id, 'REJECTED')}>
                                                            {t('Reject')}
                                                        </Button>
                                                    </>
                                                )}
                                                {e.status === 'APPROVED' && (
                                                    <Button variant="link" size="sm" className="text-success p-0 me-2" onClick={() => handleExpenseStatusChange(e.id, 'PAID')}>
                                                        {t('Mark Paid')}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">{t('No expenses')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default VolunteerDetail;
