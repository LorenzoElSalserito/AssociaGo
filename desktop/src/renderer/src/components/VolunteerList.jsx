import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, UserCheck, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const VolunteerList = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [volunteers, setVolunteers] = useState([]);
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
            const baseUrl = await associago.getApiUrl();
            const response = await fetch(`${baseUrl}/v1/volunteers?associationId=${associationId}`);
            if (response.ok) {
                const data = await response.json();
                setVolunteers(data);
            }
        } catch (error) {
            console.error("Error fetching volunteers:", error);
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

    return (
        <div className="fade-in">
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
                                    <th className="border-0">{t('Role')}</th>
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
                                            <td>{volunteer.role}</td>
                                            <td>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <Clock size={14} className="me-1" />
                                                    {volunteer.hours || 0}h
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg="success" className="fw-normal px-2 py-1 bg-opacity-10 text-success border border-success border-opacity-25">
                                                    {t('Active')}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" size="sm" className="btn-icon text-muted" onClick={() => shell.openModal('volunteer-form', { associationId, volunteerId: volunteer.id, onSuccess: fetchVolunteers })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-danger">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
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
