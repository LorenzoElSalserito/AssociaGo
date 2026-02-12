import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, FileText, Users, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import AssemblyDetail from './AssemblyDetail';

const AssemblyList = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [assemblies, setAssemblies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssemblyId, setSelectedAssemblyId] = useState(null);

    useEffect(() => {
        if (associationId) {
            fetchAssemblies();
        }
    }, [associationId]);

    const fetchAssemblies = async () => {
        setLoading(true);
        try {
            const data = await associago.assemblies.getAll();
            setAssemblies(data);
        } catch (error) {
            console.error("Error fetching assemblies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure you want to delete this assembly?'))) return;
        try {
            await associago.assemblies.delete(id);
            fetchAssemblies();
        } catch (error) {
            alert(t('Error deleting assembly'));
        }
    };

    const filteredAssemblies = assemblies.filter(assembly =>
        assembly.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDER DETAIL VIEW ---
    if (selectedAssemblyId) {
        return (
            <AssemblyDetail
                assemblyId={selectedAssemblyId}
                shell={shell}
                onBack={() => {
                    setSelectedAssemblyId(null);
                    fetchAssemblies();
                }}
            />
        );
    }

    // --- RENDER LIST VIEW ---
    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Assemblies')}</h2>
                    <p className="text-muted mb-0">{t('Manage official assemblies')}</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center" onClick={() => shell.openModal('assembly-form', { associationId, onSuccess: fetchAssemblies })}>
                    <Plus size={18} className="me-2" />
                    {t('New Assembly')}
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
                                    placeholder={t('Search assemblies...')}
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
                                    <th className="border-0">{t('Quorum')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssemblies.length > 0 ? (
                                    filteredAssemblies.map(assembly => (
                                        <tr key={assembly.id} style={{cursor: 'pointer'}} onClick={() => setSelectedAssemblyId(assembly.id)}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{assembly.title}</div>
                                                        <div className="small text-muted">{assembly.type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-muted small">
                                                    {new Date(assembly.date).toLocaleDateString()} {new Date(assembly.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <Users size={14} className="me-1" />
                                                    {assembly.firstCallQuorum ? `${assembly.firstCallQuorum}%` : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={assembly.status === 'CLOSED' ? 'secondary' : 'success'} className="fw-normal px-2 py-1">
                                                    {assembly.status}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" size="sm" className="btn-icon text-primary" onClick={() => setSelectedAssemblyId(assembly.id)}>
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-muted" onClick={() => shell.openModal('assembly-form', { associationId, assemblyId: assembly.id, onSuccess: fetchAssemblies })}>
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="btn-icon text-danger" onClick={() => handleDelete(assembly.id)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            {t('No assemblies found.')}
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

export default AssemblyList;
