import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner, Dropdown, Alert } from 'react-bootstrap';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Mail, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import CsvImporter from './CsvImporter';

const MemberList = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [medicalAlerts, setMedicalAlerts] = useState({ expiring: [], expired: [] });

    const isASD = shell?.currentAssociation?.tipo === 'ASD';

    useEffect(() => {
        if (associationId) {
            fetchMembers();
            if (isASD) fetchMedicalAlerts();
        }
    }, [associationId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Use memberships endpoint to get UserAssociation data which includes User details
            const data = await associago.memberships.getByAssociation(associationId);
            setMembers(data);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure you want to delete this member?'))) return;
        try {
            await associago.memberships.delete(id);
            fetchMembers();
        } catch (error) {
            alert(t('Error deleting member'));
        }
    };

    const handleRenew = async (memberId) => {
        if (!confirm(t("Renew membership for 1 year?"))) return;

        try {
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            const newExpirationDate = nextYear.toISOString().split('T')[0];

            await associago.memberships.renew(memberId, newExpirationDate);
            fetchMembers();
            alert(t("Membership renewed successfully!"));
        } catch (error) {
            console.error("Error renewing membership:", error);
            alert(t("Error renewing membership"));
        }
    };

    const fetchMedicalAlerts = async () => {
        try {
            const [expiring, expired] = await Promise.all([
                associago.medicalCertificates.getExpiring(associationId, 30),
                associago.medicalCertificates.getExpired(associationId)
            ]);
            setMedicalAlerts({ expiring: expiring || [], expired: expired || [] });
        } catch (e) { console.error('Error fetching medical alerts:', e); }
    };

    const getMedicalBadge = (memberId) => {
        if (!isASD) return null;
        const userId = members.find(m => m.id === memberId)?.user?.id;
        if (!userId) return null;
        if (medicalAlerts.expired.some(c => c.memberId === userId)) {
            return <Badge bg="danger" className="ms-2 fw-normal" title={t('Medical certificate expired')}>{t('Cert. Expired')}</Badge>;
        }
        if (medicalAlerts.expiring.some(c => c.memberId === userId)) {
            return <Badge bg="warning" text="dark" className="ms-2 fw-normal" title={t('Medical certificate expiring soon')}>{t('Cert. Expiring')}</Badge>;
        }
        return null;
    };

    const filteredMembers = members.filter(member =>
        member.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container-fluid fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Members')}</h2>
                    <p className="text-muted mb-0">{t('Manage association members')}</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center" onClick={() => shell.openModal('member-form', { associationId, associationType: shell?.currentAssociation?.tipo, onSuccess: fetchMembers })}>
                    <Plus size={18} className="me-2" />
                    {t('Add Member')}
                </Button>
            </div>

            {isASD && (medicalAlerts.expired.length > 0 || medicalAlerts.expiring.length > 0) && (
                <Alert variant="warning" className="d-flex align-items-center gap-2 shadow-sm mb-3">
                    <AlertTriangle size={18} />
                    <div>
                        {medicalAlerts.expired.length > 0 && (
                            <span className="fw-bold text-danger">{medicalAlerts.expired.length} {t('expired medical certificates')}</span>
                        )}
                        {medicalAlerts.expired.length > 0 && medicalAlerts.expiring.length > 0 && ' — '}
                        {medicalAlerts.expiring.length > 0 && (
                            <span className="fw-bold text-warning">{medicalAlerts.expiring.length} {t('expiring within 30 days')}</span>
                        )}
                    </div>
                </Alert>
            )}

            {showImport && (
                <div className="mb-4">
                    <CsvImporter
                        title={t('Member CSV Import')}
                        onPreview={(file) => associago.csvImport.previewMembers(file, associationId)}
                        onImport={(file) => associago.csvImport.importMembers(file, associationId)}
                    />
                </div>
            )}

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-2" style={{ width: '300px' }}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <Search size={16} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder={t('Search members...')}
                                    className="bg-light border-start-0 ps-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                        <Button variant="outline-primary" onClick={() => setShowImport((current) => !current)}>
                            {showImport ? t('Hide CSV Import') : t('Import CSV')}
                        </Button>
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
                                    <th className="border-0">{t('Email')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0">{t('Expiration')}</th>
                                    <th className="border-0">{t('Role')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map(member => (
                                        <tr key={member.id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '36px', height: '36px', fontSize: '0.9rem'}}>
                                                        {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{member.user?.firstName} {member.user?.lastName}{getMedicalBadge(member.id)}</div>
                                                        <div className="small text-muted">{member.user?.taxCode}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-muted">{member.user?.email}</div>
                                            </td>
                                            <td>
                                                <Badge bg={member.status === 'ACTIVE' ? 'success' : 'warning'} className="fw-normal px-2 py-1">
                                                    {member.status || 'ACTIVE'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="text-muted small">
                                                    {member.expirationDate ? new Date(member.expirationDate).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td>{member.role}</td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Dropdown align="end">
                                                        <Dropdown.Toggle variant="light" size="sm" className="btn-icon text-muted no-caret">
                                                            <MoreVertical size={16} />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => handleRenew(member.id)}>
                                                                <RefreshCw size={14} className="me-2" /> {t('Renew Membership')}
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => shell.openModal('member-form', { associationId, memberId: member.id, onSuccess: fetchMembers })}>
                                                                <Edit size={14} className="me-2" /> {t('Edit')}
                                                            </Dropdown.Item>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item className="text-danger" onClick={() => handleDelete(member.id)}>
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
                                            {t('No members found.')}
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

export default MemberList;
