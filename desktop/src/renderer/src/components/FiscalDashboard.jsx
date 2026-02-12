import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Spinner, Badge, Form, Modal, Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FileText, Download, PieChart, TrendingUp, TrendingDown, DollarSign, Mail, Filter, Edit, Trash2, X, Plus, Home, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { associago } from '../api';

const FiscalDashboard = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [yoyData, setYoyData] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        type: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Edit/Create Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        loadData();
    }, [associationId, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const promises = [
                associago.finance.getYoyComparison(new Date().getFullYear()),
                associago.paymentMethods.getActive(associationId),
                associago.memberships.getByAssociation(associationId)
            ];

            if (activeTab === 'transactions') {
                promises.push(associago.finance.getAllTransactions(filters));
            } else if (activeTab === 'journal') {
                promises.push(associago.finance.getJournalEntries(filters));
            }

            const results = await Promise.all(promises);
            setYoyData(results[0]);
            setPaymentMethods(results[1] || []);
            setMembers(results[2] || []);

            if (activeTab === 'transactions') {
                setTransactions(results[3]);
            } else if (activeTab === 'journal') {
                setJournalEntries(results[3]);
            }
        } catch (error) {
            console.error("Error loading fiscal data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        loadData();
    };

    const clearFilters = () => {
        setFilters({ type: '', startDate: '', endDate: '' });
        setTimeout(() => loadData(), 0);
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure you want to delete this transaction?'))) return;
        try {
            await associago.finance.deleteTransaction(id);
            loadData();
        } catch (error) {
            alert(t('Error deleting transaction'));
        }
    };

    const handleEditClick = (tx) => {
        setEditingTransaction({ ...tx });
        setShowEditModal(true);
    };

    const handleCreateRentClick = () => {
        setEditingTransaction({
            date: new Date().toISOString().split('T')[0],
            description: t('Rent Payment') + ' - ' + new Date().toLocaleString('default', { month: 'long' }),
            amount: 0,
            type: 'EXPENSE',
            category: t('Rent'),
            associationId: associationId,
            paymentMethod: ''
        });
        setShowEditModal(true);
    };

    const handleCreateTransactionClick = () => {
        setEditingTransaction({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: 0,
            type: 'INCOME',
            category: '',
            associationId: associationId,
            paymentMethod: '',
            isRenewal: false,
            quotaPeriod: 'ANNUAL',
            renewalYear: new Date().getFullYear()
        });
        setShowEditModal(true);
    };

    const handleEditSave = async () => {
        try {
            if (editingTransaction.id) {
                await associago.finance.updateTransaction(editingTransaction.id, editingTransaction);
            } else {
                await associago.finance.createTransaction(editingTransaction);
            }
            setShowEditModal(false);
            loadData();
        } catch (error) {
            alert(t('Error saving transaction'));
        }
    };

    const handleDownloadReport = async () => {
        try {
            const blob = await associago.reports.downloadFinancialReport(new Date().getFullYear());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `financial_report_${new Date().getFullYear()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Error downloading report:", error);
            alert(t('Error downloading report'));
        }
    };

    const handleDownloadReceipt = async (transactionId) => {
        try {
            const blob = await associago.reports.downloadTransactionReceipt(transactionId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_${transactionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Error downloading receipt:", error);
            alert(t('Error downloading receipt'));
        }
    };

    const handleSendMail = (tx) => {
        const subject = encodeURIComponent(`Ricevuta Pagamento ${tx.referenceId || ''}`);
        const body = encodeURIComponent(`Gentile socio,\n\nIn allegato la ricevuta del pagamento di € ${tx.amount} effettuato il ${new Date(tx.date).toLocaleDateString()}.\n\nCordiali saluti,\nIl Presidente`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    if (loading && !transactions.length && !journalEntries.length) return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    const chartData = yoyData ? [
        {
            name: t('Income'),
            current: yoyData.incomeCurrent,
            previous: yoyData.incomePrevious
        },
        {
            name: t('Expenses'),
            current: yoyData.expenseCurrent,
            previous: yoyData.expensePrevious
        }
    ] : [];

    const totalIncome = yoyData?.incomeCurrent || 0;
    const totalExpenses = yoyData?.expenseCurrent || 0;
    const netBalance = totalIncome - totalExpenses;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Fiscal Dashboard')}</h2>
                    <p className="text-muted mb-0">{t('Tax reports and fiscal documents')}</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={handleCreateRentClick}>
                        <Home size={18} className="me-2" />
                        {t('Record Rent')}
                    </Button>
                    <Button variant="outline-primary" onClick={handleCreateTransactionClick}>
                        <Plus size={18} className="me-2" />
                        {t('New Transaction')}
                    </Button>
                    <Button variant="primary" onClick={handleDownloadReport}>
                        <Download size={18} className="me-2" />
                        {t('Export PDF Report')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <p className="text-muted small text-uppercase fw-bold mb-1">{t('Total Income')}</p>
                                    <h3 className="fw-bold text-success mb-0">€ {totalIncome.toLocaleString()}</h3>
                                </div>
                                <div className="bg-success bg-opacity-10 text-success rounded-circle p-2">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <small className="text-muted">{t('Current fiscal year')}</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <p className="text-muted small text-uppercase fw-bold mb-1">{t('Total Expenses')}</p>
                                    <h3 className="fw-bold text-danger mb-0">€ {totalExpenses.toLocaleString()}</h3>
                                </div>
                                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2">
                                    <TrendingDown size={20} />
                                </div>
                            </div>
                            <small className="text-muted">{t('Current fiscal year')}</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <p className="text-muted small text-uppercase fw-bold mb-1">{t('Net Balance')}</p>
                                    <h3 className={`fw-bold mb-0 ${netBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
                                        € {netBalance.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2">
                                    <DollarSign size={20} />
                                </div>
                            </div>
                            <small className="text-muted">{t('Current fiscal year')}</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                {/* Chart */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                            <h5 className="fw-bold mb-0">{t('Year-over-Year Comparison')}</h5>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Legend />
                                    <Bar dataKey="current" name={new Date().getFullYear().toString()} fill="#0d6efd" radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar dataKey="previous" name={(new Date().getFullYear() - 1).toString()} fill="#e9ecef" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Quick Reports */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                            <h5 className="fw-bold mb-0">{t('Fiscal Dashboard')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-3">
                                <div className="p-3 border rounded d-flex align-items-center justify-content-between hover-shadow transition">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded me-3">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="fw-bold">{t('Annual Report')}</div>
                                            <div className="small text-muted">{t('Generate the annual fiscal report for your association.')}</div>
                                        </div>
                                    </div>
                                    <Button variant="link" size="sm" onClick={handleDownloadReport}>
                                        <Download size={18} />
                                    </Button>
                                </div>

                                <div className="p-3 border rounded d-flex align-items-center justify-content-between hover-shadow transition">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-success bg-opacity-10 text-success p-2 rounded me-3">
                                            <PieChart size={20} />
                                        </div>
                                        <div>
                                            <div className="fw-bold">{t('Expense Analysis')}</div>
                                            <div className="small text-muted">{t('Detailed breakdown of expenses by category.')}</div>
                                        </div>
                                    </div>
                                    <Button variant="link" size="sm">
                                        <Download size={18} />
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Transactions / Journal Tabs */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
                    <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="transactions" className="d-flex align-items-center gap-2"><DollarSign size={18}/> {t('Transactions')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="journal" className="d-flex align-items-center gap-2"><BookOpen size={18}/> {t('Journal Entries')}</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>

                <Card.Body>
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="outline-secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter size={16} className="me-2" /> {t('Filter')}
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="bg-light p-3 rounded mb-3">
                            <Row className="g-3">
                                <Col md={3}>
                                    <Form.Label className="small">{t('Type')}</Form.Label>
                                    <Form.Select size="sm" name="type" value={filters.type} onChange={handleFilterChange}>
                                        <option value="">{t('All Types')}</option>
                                        <option value="INCOME">{t('Income')}</option>
                                        <option value="EXPENSE">{t('Expenses')}</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Label className="small">{t('Start Date')}</Form.Label>
                                    <Form.Control size="sm" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                                </Col>
                                <Col md={3}>
                                    <Form.Label className="small">{t('End Date')}</Form.Label>
                                    <Form.Control size="sm" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                                </Col>
                                <Col md={3} className="d-flex align-items-end gap-2">
                                    <Button size="sm" variant="primary" className="flex-grow-1" onClick={applyFilters}>{t('Apply Filters')}</Button>
                                    <Button size="sm" variant="outline-secondary" onClick={clearFilters}>{t('Clear Filters')}</Button>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <Table hover responsive className="align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-3">{t('Date')}</th>
                                    <th className="border-0">{t('Description')}</th>
                                    <th className="border-0">{t('Category')}</th>
                                    <th className="border-0 text-end pe-3">{t('Amount')}</th>
                                    <th className="border-0 text-end pe-3">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td className="ps-3 text-muted">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="fw-medium">{tx.description}</td>
                                            <td><Badge bg="light" text="dark" className="border fw-normal">{tx.category}</Badge></td>
                                            <td className={`text-end pe-3 fw-bold ${tx.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                                                {tx.type === 'INCOME' ? '+' : '-'}€ {tx.amount.toLocaleString()}
                                                {tx.commissionAmount > 0 && (
                                                    <div className="small text-muted fw-normal">
                                                        {t('Comm.')}: €{tx.commissionAmount}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-end pe-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="link" size="sm" className="text-muted p-0" onClick={() => handleEditClick(tx)} title={t('Edit')}>
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDelete(tx.id)} title={t('Delete')}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                    <Button variant="link" size="sm" className="text-muted p-0" onClick={() => handleDownloadReceipt(tx.id)} title={t('Download Receipt')}>
                                                        <Download size={16} />
                                                    </Button>
                                                    <Button variant="link" size="sm" className="text-muted p-0" onClick={() => handleSendMail(tx)} title={t('Send Email')}>
                                                        <Mail size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            {t('No recent activity')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}

                    {activeTab === 'journal' && (
                        <Table hover responsive className="align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-3">{t('Date')}</th>
                                    <th className="border-0">{t('Description')}</th>
                                    <th className="border-0">{t('Account')}</th>
                                    <th className="border-0 text-end pe-3">{t('Debit')}</th>
                                    <th className="border-0 text-end pe-3">{t('Credit')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {journalEntries.length > 0 ? (
                                    journalEntries.map(entry => (
                                        <React.Fragment key={entry.id}>
                                            {entry.lines.map((line, idx) => (
                                                <tr key={`${entry.id}-${idx}`} className={idx === 0 ? "border-top" : ""}>
                                                    <td className="ps-3 text-muted">{idx === 0 ? new Date(entry.date).toLocaleDateString() : ''}</td>
                                                    <td className="fw-medium">{idx === 0 ? entry.description : ''}</td>
                                                    <td>
                                                        <Badge bg="light" text="dark" className="border fw-normal">
                                                            {line.account.code} - {line.account.name}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end pe-3 text-muted">
                                                        {line.debit > 0 ? `€ ${line.debit.toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="text-end pe-3 text-muted">
                                                        {line.credit > 0 ? `€ ${line.credit.toLocaleString()}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            {t('No journal entries found')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Edit/Create Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingTransaction?.id ? t('Edit Transaction') : t('New Transaction')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingTransaction && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Date')}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={editingTransaction.date}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Description')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingTransaction.description}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Category')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingTransaction.category || ''}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Amount')}</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={editingTransaction.amount}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value)})}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Type')}</Form.Label>
                                <Form.Select
                                    value={editingTransaction.type}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, type: e.target.value})}
                                >
                                    <option value="INCOME">{t('Income')}</option>
                                    <option value="EXPENSE">{t('Expenses')}</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Payment Method')}</Form.Label>
                                <Form.Select
                                    value={editingTransaction.paymentMethod || ''}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, paymentMethod: e.target.value})}
                                >
                                    <option value="">{t('Select...')}</option>
                                    {paymentMethods.map(method => (
                                        <option key={method.id} value={method.name}>
                                            {method.name} {method.hasCommission ? `(${method.percentageCommission}% + €${method.fixedCommission})` : ''}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {editingTransaction.type === 'INCOME' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label={t('Is Membership Renewal')}
                                            checked={editingTransaction.isRenewal || false}
                                            onChange={(e) => setEditingTransaction({...editingTransaction, isRenewal: e.target.checked})}
                                        />
                                    </Form.Group>

                                    {editingTransaction.isRenewal && (
                                        <div className="p-3 bg-light rounded mb-3 border">
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('Member')}</Form.Label>
                                                <Form.Select
                                                    value={editingTransaction.membershipId || ''}
                                                    onChange={(e) => setEditingTransaction({...editingTransaction, membershipId: e.target.value})}
                                                >
                                                    <option value="">{t('Select Member...')}</option>
                                                    {members.map(m => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.user.firstName} {m.user.lastName} ({m.membershipCardNumber})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                            <Row>
                                                <Col>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{t('Period')}</Form.Label>
                                                        <Form.Select
                                                            value={editingTransaction.quotaPeriod || 'ANNUAL'}
                                                            onChange={(e) => setEditingTransaction({...editingTransaction, quotaPeriod: e.target.value})}
                                                        >
                                                            <option value="ANNUAL">{t('Annual')}</option>
                                                            <option value="SEMIANNUAL">{t('Semiannual')}</option>
                                                            <option value="MONTHLY">{t('Monthly')}</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{t('Year')}</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={editingTransaction.renewalYear || new Date().getFullYear()}
                                                            onChange={(e) => setEditingTransaction({...editingTransaction, renewalYear: parseInt(e.target.value)})}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        {t('Cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleEditSave}>
                        {t('Save Changes')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FiscalDashboard;
