import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Nav, Spinner } from 'react-bootstrap';
import { ArrowLeft, Plus, Edit, Trash2, RefreshCw, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const InventoryDetail = ({ itemId, shell, onBack }) => {
    const { t } = useTranslation();
    const [item, setItem] = useState(null);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('loans');

    useEffect(() => {
        loadData();
    }, [itemId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [i, l] = await Promise.all([
                associago.inventory.getById(itemId),
                associago.inventory.getLoansByItem(itemId)
            ]);
            setItem(i);
            setLoans(l);
        } catch (error) {
            console.error("Error loading inventory details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturnLoan = async (loanId) => {
        if (!confirm(t('Confirm return of item?'))) return;
        try {
            await associago.inventory.returnLoan(loanId);
            loadData();
        } catch (error) {
            alert(t('Error returning item'));
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;
    if (!item) return <div className="text-center p-5 text-muted">{t('Item not found')}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="p-0 me-3 text-dark" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h2 className="fw-bold text-dark mb-0">{item.name}</h2>
                    <div className="text-muted small">
                        <Badge bg="secondary" className="me-2">{item.category}</Badge>
                        {item.location}
                    </div>
                </div>
                <div className="ms-auto">
                    <Button variant="outline-primary" className="me-2" onClick={() => shell.openModal('inventory-form', { associationId: item.associationId, itemId: item.id, onSuccess: loadData })}>
                        <Edit size={18} className="me-2" /> {t('Edit')}
                    </Button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Quantity')}</h6>
                            <h3 className="fw-bold mb-0">{item.quantity}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Condition')}</h6>
                            <h3 className="fw-bold mb-0 text-primary">{t(item.condition)}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Status')}</h6>
                            <Badge bg={item.status === 'AVAILABLE' ? 'success' : 'warning'} className="fs-6">
                                {t(item.status)}
                            </Badge>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
                    <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="loans" className="d-flex align-items-center gap-2"><History size={18}/> {t('Loans History')}</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'loans' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('inventory-loan-form', { itemId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Register Loan')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">{t('Member ID')}</th>
                                        <th>{t('Loan Date')}</th>
                                        <th>{t('Return Date')}</th>
                                        <th>{t('Status')}</th>
                                        <th className="text-end pe-4">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map(l => (
                                        <tr key={l.id}>
                                            <td className="ps-4">#{l.userAssociationId}</td>
                                            <td>{new Date(l.loanDate).toLocaleDateString()}</td>
                                            <td>{l.actualReturnDate ? new Date(l.actualReturnDate).toLocaleDateString() : (l.expectedReturnDate ? new Date(l.expectedReturnDate).toLocaleDateString() + ' (Exp)' : '-')}</td>
                                            <td>
                                                <Badge bg={l.status === 'ACTIVE' ? 'warning' : 'success'} text={l.status === 'ACTIVE' ? 'dark' : 'white'}>
                                                    {t(l.status)}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                {l.status === 'ACTIVE' && (
                                                    <Button variant="outline-success" size="sm" onClick={() => handleReturnLoan(l.id)}>
                                                        <RefreshCw size={14} className="me-1"/> {t('Return')}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {loans.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">{t('No loans history')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default InventoryDetail;
