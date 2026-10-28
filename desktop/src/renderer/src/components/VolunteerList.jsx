import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Search, Plus, Filter, Edit, Trash2, UserCheck, Clock, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import RowActions from './common/RowActions';
import VolunteerDetail from './VolunteerDetail';

const VolunteerList = ({ associationId, shell }) => {
    const { t, i18n } = useTranslation();
    const [volunteers, setVolunteers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (associationId) {
            fetchVolunteers();
        }
    }, [associationId]);

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            setError(null);
            const [data, members] = await Promise.all([associago.volunteers.getAll(), associago.members.getAll()]);
            setVolunteers(data.map(volunteer => {
                const member = members.find(m => m.id === volunteer.memberId);
                return { ...volunteer, name: member ? `${member.firstName} ${member.lastName}` : `#${volunteer.memberId}`, email: member?.email };
            }));
        } catch (error) {
            console.error("Error fetching volunteers:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVolunteer = () => {
        shell.openModal('volunteer-form', { associationId, onSuccess: fetchVolunteers });
    };

    const filteredVolunteers = volunteers.filter(volunteer =>
        volunteer.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async id => {
        if (!window.confirm(t('Are you sure you want to delete this volunteer?'))) return;
        try { await associago.volunteers.delete(id); await fetchVolunteers(); }
        catch (error) { setError(error.message); }
    };
    if (selectedId) return <VolunteerDetail volunteerId={selectedId} shell={shell} onBack={() => { setSelectedId(null); fetchVolunteers(); }} />;

    return (
        <div className="fade-in">
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Volunteers')}</h2>
                    <p className="text-muted mb-0">{t('Manage volunteer activities')}</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center" onClick={handleAddVolunteer}>
                    <Plus size={18} className="me-2" />
                    {t('Add Volunteer')}
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
                                    placeholder={t('Search volunteers...')}
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
                                    <th className="border-0">{t('Skills')}</th>
                                    <th className="border-0">{t('Hours')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVolunteers.length > 0 ? (
                                    filteredVolunteers.map(volunteer => (
                                        <tr key={volunteer.id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                        <UserCheck size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{volunteer.name}</div>
                                                        <div className="small text-muted">{volunteer.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{volunteer.skills || '—'}</td>
                                            <td>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <Clock size={14} className="me-1" />
                                                    {Number(volunteer.hours || 0).toLocaleString(i18n.language)}h
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={volunteer.status === 'INACTIVE' ? 'secondary' : 'success'} className={`fw-normal px-2 py-1 bg-opacity-10 border border-opacity-25 ${volunteer.status === 'INACTIVE' ? 'text-secondary border-secondary' : 'text-success border-success'}`}>
                                                    {t(volunteer.status === 'INACTIVE' ? 'Inactive' : 'Active')}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <RowActions actions={[
                                                    { key: 'view', icon: <Eye size={16} />, label: t('View Details'), onClick: () => setSelectedId(volunteer.id) },
                                                    {
                                                        key: 'edit',
                                                        icon: <Edit size={16} />,
                                                        label: t('Edit'),
                                                        onClick: () => shell.openModal('volunteer-form', { associationId, volunteerId: volunteer.id, onSuccess: fetchVolunteers }),
                                                    },
                                                    {
                                                        key: 'delete',
                                                        onClick: () => handleDelete(volunteer.id),
                                                        icon: <Trash2 size={16} />,
                                                        label: t('Delete'),
                                                        textClass: 'text-danger',
                                                    },
                                                ]} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            {t('No volunteers found.')}
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

export default VolunteerList;
