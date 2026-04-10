import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner, Row, Col, ProgressBar, Modal } from 'react-bootstrap';
import { Search, Plus, Trash2, Edit, CheckCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import { translateBudgetStatus, translateBudgetSection } from '../utils/enumTranslations';

const BudgetDashboard = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [lines, setLines] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showLineForm, setShowLineForm] = useState(false);
    const [editingLine, setEditingLine] = useState(null);
    const [form, setForm] = useState({ title: '', year: new Date().getFullYear(), notes: '' });
    const [lineForm, setLineForm] = useState({ category: '', section: 'INCOME', budgetedAmount: 0 });

    useEffect(() => {
        if (associationId) fetchBudgets();
    }, [associationId]);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const data = await associago.budgets.getAll(associationId);
            setBudgets(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchLines = async (budgetId) => {
        try {
            const data = await associago.budgets.getLines(budgetId);
            setLines(data || []);
        } catch (e) { console.error(e); }
    };

    const selectBudget = (b) => {
        setSelectedBudget(b);
        fetchLines(b.id);
    };

    const handleCreate = async () => {
        try {
            await associago.budgets.create({ ...form, associationId });
            setShowForm(false);
            setForm({ title: '', year: new Date().getFullYear(), notes: '' });
            fetchBudgets();
        } catch (e) { alert(e.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            await associago.budgets.delete(id);
            if (selectedBudget?.id === id) { setSelectedBudget(null); setLines([]); }
            fetchBudgets();
        } catch (e) { alert(e.message); }
    };

    const handleApprove = async (id) => {
        try {
            await associago.budgets.approve(id, shell.currentUser?.id);
            fetchBudgets();
            if (selectedBudget?.id === id) {
                const updated = await associago.budgets.getById(id);
                setSelectedBudget(updated);
            }
        } catch (e) { alert(e.message); }
    };

    const handleSyncActuals = async (id) => {
        try {
            await associago.budgets.syncActuals(id);
            fetchLines(id);
        } catch (e) { alert(e.message); }
    };

    const handleAddLine = async () => {
        try {
            if (editingLine) {
                await associago.budgets.updateLine(editingLine.id, lineForm);
            } else {
                await associago.budgets.addLine(selectedBudget.id, lineForm);
            }
            setShowLineForm(false);
            setEditingLine(null);
            setLineForm({ category: '', section: 'INCOME', budgetedAmount: 0 });
            fetchLines(selectedBudget.id);
        } catch (e) { alert(e.message); }
    };

    const handleDeleteLine = async (lineId) => {
        try {
            await associago.budgets.deleteLine(lineId);
            fetchLines(selectedBudget.id);
        } catch (e) { alert(e.message); }
    };

    const totalBudgetedIncome = lines.filter(l => l.section === 'INCOME').reduce((s, l) => s + (l.budgetedAmount || 0), 0);
    const totalBudgetedExpense = lines.filter(l => l.section === 'EXPENSE').reduce((s, l) => s + (l.budgetedAmount || 0), 0);
    const totalActualIncome = lines.filter(l => l.section === 'INCOME').reduce((s, l) => s + (l.actualAmount || 0), 0);
    const totalActualExpense = lines.filter(l => l.section === 'EXPENSE').reduce((s, l) => s + (l.actualAmount || 0), 0);

    if (selectedBudget) {
        return (
            <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <Button variant="link" className="p-0 mb-1" onClick={() => { setSelectedBudget(null); setLines([]); }}>
                            &larr; {t('Back to Budgets')}
                        </Button>
                        <h2 className="fw-bold mb-1">{selectedBudget.title}</h2>
                        <Badge bg={selectedBudget.status === 'APPROVED' ? 'success' : 'warning'}>{translateBudgetStatus(selectedBudget.status, t)}</Badge>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" size="sm" onClick={() => handleSyncActuals(selectedBudget.id)}>
                            <RefreshCw size={16} className="me-1" />{t('Sync Actuals')}
                        </Button>
                        {selectedBudget.status !== 'APPROVED' && (
                            <Button variant="success" size="sm" onClick={() => handleApprove(selectedBudget.id)}>
                                <CheckCircle size={16} className="me-1" />{t('Approve')}
                            </Button>
                        )}
                        <Button variant="primary" size="sm" onClick={() => { setEditingLine(null); setLineForm({ category: '', section: 'INCOME', budgetedAmount: 0 }); setShowLineForm(true); }}>
                            <Plus size={16} className="me-1" />{t('Add Line')}
                        </Button>
                    </div>
                </div>

                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Budgeted Income')}</div>
                            <div className="fw-bold text-success fs-5">&euro; {totalBudgetedIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Actual Income')}</div>
                            <div className="fw-bold text-primary fs-5">&euro; {totalActualIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Budgeted Expenses')}</div>
                            <div className="fw-bold text-danger fs-5">&euro; {totalBudgetedExpense.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Actual Expenses')}</div>
                            <div className="fw-bold text-warning fs-5">&euro; {totalActualExpense.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                        </Card>
                    </Col>
                </Row>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Category')}</th>
                                    <th className="border-0">{t('Section')}</th>
                                    <th className="border-0 text-end">{t('Budgeted')}</th>
                                    <th className="border-0 text-end">{t('Actual')}</th>
                                    <th className="border-0 text-end">{t('Variance')}</th>
                                    <th className="border-0">{t('Progress')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map(line => {
                                    const variance = (line.actualAmount || 0) - (line.budgetedAmount || 0);
                                    const pct = line.budgetedAmount > 0 ? Math.min(((line.actualAmount || 0) / line.budgetedAmount) * 100, 150) : 0;
                                    return (
                                        <tr key={line.id}>
                                            <td className="ps-4 fw-bold">{line.category}</td>
                                            <td><Badge bg={line.section === 'INCOME' ? 'success' : 'danger'} className="fw-normal">{translateBudgetSection(line.section, t)}</Badge></td>
                                            <td className="text-end">&euro; {(line.budgetedAmount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                                            <td className="text-end">&euro; {(line.actualAmount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                                            <td className={`text-end ${variance >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {variance >= 0 ? '+' : ''}&euro; {variance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ minWidth: 120 }}>
                                                <ProgressBar now={pct} variant={pct > 100 ? 'danger' : pct > 80 ? 'warning' : 'primary'} style={{ height: 8 }} />
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button variant="light" size="sm" className="me-1" onClick={() => { setEditingLine(line); setLineForm({ category: line.category, section: line.section, budgetedAmount: line.budgetedAmount }); setShowLineForm(true); }}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button variant="light" size="sm" className="text-danger" onClick={() => handleDeleteLine(line.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {lines.length === 0 && (
                                    <tr><td colSpan="7" className="text-center py-5 text-muted">{t('No budget lines yet.')}</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Modal show={showLineForm} onHide={() => setShowLineForm(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingLine ? t('Edit Line') : t('Add Budget Line')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Category')}</Form.Label>
                            <Form.Control value={lineForm.category} onChange={e => setLineForm({ ...lineForm, category: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Section')}</Form.Label>
                            <Form.Select value={lineForm.section} onChange={e => setLineForm({ ...lineForm, section: e.target.value })}>
                                <option value="INCOME">{t('Income')}</option>
                                <option value="EXPENSE">{t('Expense')}</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Budgeted Amount')}</Form.Label>
                            <Form.Control type="number" step="0.01" value={lineForm.budgetedAmount} onChange={e => setLineForm({ ...lineForm, budgetedAmount: parseFloat(e.target.value) || 0 })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowLineForm(false)}>{t('Cancel')}</Button>
                        <Button variant="primary" onClick={handleAddLine}>{editingLine ? t('Save') : t('Add')}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Budgets')}</h2>
                    <p className="text-muted mb-0">{t('Budget planning and tracking')}</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} className="me-2" />{t('New Budget')}
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
                                    <th className="border-0 ps-4">{t('Title')}</th>
                                    <th className="border-0">{t('Year')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgets.map(b => (
                                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => selectBudget(b)}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
                                                    <BarChart3 size={20} />
                                                </div>
                                                <div className="fw-bold">{b.title}</div>
                                            </div>
                                        </td>
                                        <td>{b.year}</td>
                                        <td><Badge bg={b.status === 'APPROVED' ? 'success' : 'warning'} className="fw-normal">{translateBudgetStatus(b.status, t)}</Badge></td>
                                        <td className="text-end pe-4" onClick={e => e.stopPropagation()}>
                                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(b.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {budgets.length === 0 && (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">{t('No budgets found.')}</td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showForm} onHide={() => setShowForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('New Budget')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Title')}</Form.Label>
                        <Form.Control value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Year')}</Form.Label>
                        <Form.Control type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Notes')}</Form.Label>
                        <Form.Control as="textarea" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowForm(false)}>{t('Cancel')}</Button>
                    <Button variant="primary" onClick={handleCreate}>{t('Create')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BudgetDashboard;
