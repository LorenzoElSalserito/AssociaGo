import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Row, Col, Modal, Form } from 'react-bootstrap';
import { Plus, Trash2, Download, CheckCircle, FileText, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import { translateBalanceStatus } from '../utils/enumTranslations';

const AnnualBalanceDashboard = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBalance, setSelectedBalance] = useState(null);
    const [lines, setLines] = useState([]);
    const [showComputeForm, setShowComputeForm] = useState(false);
    const [computeYear, setComputeYear] = useState(new Date().getFullYear());
    const [missingSigners, setMissingSigners] = useState([]);

    useEffect(() => {
        if (associationId) fetchBalances();
    }, [associationId]);

    const fetchBalances = async () => {
        setLoading(true);
        try {
            const data = await associago.balances.getAll(associationId);
            setBalances(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const selectBalance = async (b) => {
        setSelectedBalance(b);
        try {
            const [linesData, missing] = await Promise.all([
                associago.balances.getLines(b.id),
                associago.balances.checkSigners(b.id)
            ]);
            setLines(linesData || []);
            setMissingSigners(missing || []);
        } catch (e) { console.error(e); }
    };

    const handleCompute = async () => {
        try {
            const result = await associago.balances.compute(associationId, computeYear);
            setShowComputeForm(false);
            fetchBalances();
            selectBalance(result);
        } catch (e) { alert(e.message); }
    };

    const handleApprove = async () => {
        try {
            await associago.balances.approve(selectedBalance.id, shell.currentUser?.id);
            const updated = await associago.balances.getById(selectedBalance.id);
            setSelectedBalance(updated);
            fetchBalances();
        } catch (e) { alert(e.message); }
    };

    const handleDownloadPdf = async () => {
        try {
            const blob = await associago.balances.downloadPdf(selectedBalance.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bilancio_${selectedBalance.year}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) { alert(e.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            await associago.balances.delete(id);
            if (selectedBalance?.id === id) { setSelectedBalance(null); setLines([]); }
            fetchBalances();
        } catch (e) { alert(e.message); }
    };

    const incomeLines = lines.filter(l => l.section === 'INCOME');
    const expenseLines = lines.filter(l => l.section === 'EXPENSE');

    if (selectedBalance) {
        return (
            <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <Button variant="link" className="p-0 mb-1" onClick={() => { setSelectedBalance(null); setLines([]); }}>
                            &larr; {t('Back to Balances')}
                        </Button>
                        <h2 className="fw-bold mb-1">{selectedBalance.title || t('balance.titleWithYear', { year: selectedBalance.year })}</h2>
                        <Badge bg={selectedBalance.status === 'APPROVED' ? 'success' : 'info'} className="me-2">{translateBalanceStatus(selectedBalance.status, t)}</Badge>
                        {selectedBalance.checksum && <small className="text-muted">SHA-256: {selectedBalance.checksum?.substring(0, 16)}...</small>}
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" size="sm" onClick={handleDownloadPdf}>
                            <Download size={16} className="me-1" />{t('Download PDF')}
                        </Button>
                        {selectedBalance.status !== 'APPROVED' && (
                            <Button variant="success" size="sm" onClick={handleApprove} disabled={missingSigners.length > 0}>
                                <CheckCircle size={16} className="me-1" />{t('Approve')}
                            </Button>
                        )}
                    </div>
                </div>

                {missingSigners.length > 0 && (
                    <div className="alert alert-warning d-flex align-items-center mb-4">
                        <AlertTriangle size={18} className="me-2" />
                        {t('Missing signers')}: {missingSigners.join(', ')}
                    </div>
                )}

                <Row className="mb-4">
                    <Col md={4}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Total Income')}</div>
                            <div className="fw-bold text-success fs-4">&euro; {(selectedBalance.totalIncome || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Total Expenses')}</div>
                            <div className="fw-bold text-danger fs-4">&euro; {(selectedBalance.totalExpenses || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className={`border-0 shadow-sm text-center p-3`}>
                            <div className="text-muted small">{t('Net Result')}</div>
                            <div className={`fw-bold fs-4 ${(selectedBalance.netResult || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                &euro; {(selectedBalance.netResult || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-success bg-opacity-10 border-0">
                                <h5 className="mb-0 text-success">{t('Income')}</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table hover className="mb-0">
                                    <tbody>
                                        {incomeLines.map(line => (
                                            <tr key={line.id} className={line.subtotal ? 'fw-bold bg-light' : ''}>
                                                <td className="ps-4">{line.label}</td>
                                                <td className="text-end pe-4">&euro; {(line.amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-danger bg-opacity-10 border-0">
                                <h5 className="mb-0 text-danger">{t('Expenses')}</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table hover className="mb-0">
                                    <tbody>
                                        {expenseLines.map(line => (
                                            <tr key={line.id} className={line.subtotal ? 'fw-bold bg-light' : ''}>
                                                <td className="ps-4">{line.label}</td>
                                                <td className="text-end pe-4">&euro; {(line.amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Annual Balance')}</h2>
                    <p className="text-muted mb-0">{t('Annual financial statements')}</p>
                </div>
                <Button variant="primary" onClick={() => setShowComputeForm(true)}>
                    <Plus size={18} className="me-2" />{t('Compute Balance')}
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Year')}</th>
                                    <th className="border-0">{t('Title')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end">{t('Net Result')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balances.map(b => (
                                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => selectBalance(b)}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
                                                    <FileText size={20} />
                                                </div>
                                                <span className="fw-bold">{b.year}</span>
                                            </div>
                                        </td>
                                        <td>{b.title}</td>
                                        <td><Badge bg={b.status === 'APPROVED' ? 'success' : 'info'} className="fw-normal">{translateBalanceStatus(b.status, t)}</Badge></td>
                                        <td className={`text-end ${(b.netResult || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                            &euro; {(b.netResult || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-end pe-4" onClick={e => e.stopPropagation()}>
                                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(b.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {balances.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">{t('No balances computed yet.')}</td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showComputeForm} onHide={() => setShowComputeForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('Compute Annual Balance')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>{t('Year')}</Form.Label>
                        <Form.Control type="number" value={computeYear} onChange={e => setComputeYear(parseInt(e.target.value))} />
                    </Form.Group>
                    <p className="text-muted mt-3 small">{t('This will compute the balance from all registered transactions for the selected year.')}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowComputeForm(false)}>{t('Cancel')}</Button>
                    <Button variant="primary" onClick={handleCompute}>{t('Compute')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AnnualBalanceDashboard;
