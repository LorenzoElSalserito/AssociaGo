import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Nav, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { Plus, Trash2, Edit, Send, Users, Mail, FileText, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const CommunicationDashboard = ({ associationId, shell }) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState('messages');
    const [communications, setCommunications] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Message form
    const [showForm, setShowForm] = useState(false);
    const [editingComm, setEditingComm] = useState(null);
    const [form, setForm] = useState({ subject: '', bodyHtml: '', bodyText: '', senderEmail: '', senderName: '', segmentFilter: '' });

    // Template form
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({ name: '', subject: '', bodyHtml: '', bodyText: '' });

    // Detail view
    const [selectedComm, setSelectedComm] = useState(null);
    const [recipients, setRecipients] = useState([]);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (associationId) fetchData();
    }, [associationId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [comms, tpls] = await Promise.all([
                associago.communications.getAll(associationId),
                associago.communications.getTemplates(associationId)
            ]);
            setCommunications(comms || []);
            setTemplates(tpls || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- Message CRUD ---
    const handleSaveMessage = async () => {
        try {
            if (editingComm) {
                await associago.communications.update(editingComm.id, { ...form, associationId });
            } else {
                await associago.communications.create({ ...form, associationId, status: 'DRAFT' });
            }
            setShowForm(false);
            resetForm();
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            await associago.communications.delete(id);
            if (selectedComm?.id === id) setSelectedComm(null);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleResolveRecipients = async (id) => {
        try {
            const result = await associago.communications.resolveRecipients(id);
            setRecipients(result || []);
            setMessage({ type: 'success', text: `${(result || []).length} ${t('recipients resolved')}` });
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleSend = async (id) => {
        if (!confirm(t('Send this communication to all recipients?'))) return;
        try {
            await associago.communications.send(id, shell.currentUser?.id);
            setMessage({ type: 'success', text: t('Communication sent successfully.') });
            fetchData();
            if (selectedComm?.id === id) {
                const updated = await associago.communications.getById(id);
                setSelectedComm(updated);
            }
        } catch (e) { alert(e.message); }
    };

    const openDetail = async (comm) => {
        setSelectedComm(comm);
        try {
            const recs = await associago.communications.getRecipients(comm.id);
            setRecipients(recs || []);
        } catch (e) { setRecipients([]); }
    };

    const resetForm = () => {
        setEditingComm(null);
        setForm({ subject: '', bodyHtml: '', bodyText: '', senderEmail: '', senderName: '', segmentFilter: '' });
    };

    // --- Template CRUD ---
    const handleSaveTemplate = async () => {
        try {
            if (editingTemplate) {
                await associago.communications.updateTemplate(editingTemplate.id, { ...templateForm, associationId });
            } else {
                await associago.communications.createTemplate({ ...templateForm, associationId });
            }
            setShowTemplateForm(false);
            setEditingTemplate(null);
            setTemplateForm({ name: '', subject: '', bodyHtml: '', bodyText: '' });
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleDeleteTemplate = async (id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            await associago.communications.deleteTemplate(id);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const applyTemplate = (tpl) => {
        setForm({ ...form, subject: tpl.subject || '', bodyHtml: tpl.bodyHtml || '', bodyText: tpl.bodyText || '' });
    };

    const statusBadge = (status) => {
        const map = { DRAFT: 'secondary', SENDING: 'warning', SENT: 'success', FAILED: 'danger' };
        return <Badge bg={map[status] || 'secondary'}>{t(status || 'DRAFT')}</Badge>;
    };

    // --- Detail view ---
    if (selectedComm) {
        return (
            <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <Button variant="link" className="p-0 mb-1" onClick={() => setSelectedComm(null)}>
                            &larr; {t('Back')}
                        </Button>
                        <h2 className="fw-bold mb-1">{selectedComm.subject}</h2>
                        {statusBadge(selectedComm.status)}
                    </div>
                    <div className="d-flex gap-2">
                        {selectedComm.status === 'DRAFT' && (
                            <>
                                <Button variant="outline-primary" size="sm" onClick={() => handleResolveRecipients(selectedComm.id)}>
                                    <Users size={16} className="me-1" />{t('Resolve Recipients')}
                                </Button>
                                <Button variant="success" size="sm" onClick={() => handleSend(selectedComm.id)} disabled={!selectedComm.totalRecipients}>
                                    <Send size={16} className="me-1" />{t('Send')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>{message.text}</Alert>}

                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Total Recipients')}</div>
                            <div className="fw-bold fs-4">{selectedComm.totalRecipients || 0}</div>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Delivered')}</div>
                            <div className="fw-bold text-success fs-4">{selectedComm.deliveredCount || 0}</div>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Failed')}</div>
                            <div className="fw-bold text-danger fs-4">{selectedComm.failedCount || 0}</div>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center p-3">
                            <div className="text-muted small">{t('Sent At')}</div>
                            <div className="fw-bold fs-6">{selectedComm.sentAt ? new Date(selectedComm.sentAt).toLocaleString() : '-'}</div>
                        </Card>
                    </Col>
                </Row>

                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-light"><h6 className="mb-0">{t('Message Content')}</h6></Card.Header>
                    <Card.Body>
                        <div dangerouslySetInnerHTML={{ __html: selectedComm.bodyHtml || selectedComm.bodyText || '' }} />
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light"><h6 className="mb-0">{t('Recipients')} ({recipients.length})</h6></Card.Header>
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">{t('Name')}</th>
                                    <th>{t('Email')}</th>
                                    <th>{t('Status')}</th>
                                    <th>{t('Sent At')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recipients.map(r => (
                                    <tr key={r.id}>
                                        <td className="ps-4">{r.name}</td>
                                        <td>{r.email}</td>
                                        <td><Badge bg={r.status === 'SENT' ? 'success' : r.status === 'FAILED' ? 'danger' : 'secondary'}>{r.status || 'PENDING'}</Badge></td>
                                        <td>{r.sentAt ? new Date(r.sentAt).toLocaleString() : '-'}</td>
                                    </tr>
                                ))}
                                {recipients.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">{t('No recipients resolved yet.')}</td></tr>}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Communications')}</h2>
                    <p className="text-muted mb-0">{t('Email communications and templates')}</p>
                </div>
                <div className="d-flex gap-2">
                    {tab === 'templates' ? (
                        <Button variant="primary" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', bodyHtml: '', bodyText: '' }); setShowTemplateForm(true); }}>
                            <Plus size={18} className="me-1" />{t('New Template')}
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>
                            <Plus size={18} className="me-1" />{t('New Message')}
                        </Button>
                    )}
                </div>
            </div>

            {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>{message.text}</Alert>}

            <Nav variant="tabs" className="mb-3">
                <Nav.Item><Nav.Link active={tab === 'messages'} onClick={() => setTab('messages')}>{t('Messages')} <Badge bg="secondary" className="ms-1">{communications.length}</Badge></Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link active={tab === 'templates'} onClick={() => setTab('templates')}>{t('Templates')} <Badge bg="secondary" className="ms-1">{templates.length}</Badge></Nav.Link></Nav.Item>
            </Nav>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                    ) : tab === 'messages' ? (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Subject')}</th>
                                    <th className="border-0">{t('Status')}</th>
                                    <th className="border-0">{t('Recipients')}</th>
                                    <th className="border-0">{t('Date')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {communications.map(c => (
                                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(c)}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
                                                    <Mail size={20} />
                                                </div>
                                                <span className="fw-bold">{c.subject}</span>
                                            </div>
                                        </td>
                                        <td>{statusBadge(c.status)}</td>
                                        <td>{c.totalRecipients || 0}</td>
                                        <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                                        <td className="text-end pe-4" onClick={e => e.stopPropagation()}>
                                            {c.status === 'DRAFT' && (
                                                <Button variant="light" size="sm" className="me-1" onClick={() => { setEditingComm(c); setForm({ subject: c.subject, bodyHtml: c.bodyHtml || '', bodyText: c.bodyText || '', senderEmail: c.senderEmail || '', senderName: c.senderName || '', segmentFilter: c.segmentFilter || '' }); setShowForm(true); }}>
                                                    <Edit size={14} />
                                                </Button>
                                            )}
                                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(c.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {communications.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted">{t('No communications yet.')}</td></tr>}
                            </tbody>
                        </Table>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Template Name')}</th>
                                    <th className="border-0">{t('Subject')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map(tpl => (
                                    <tr key={tpl.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
                                                    <FileText size={20} />
                                                </div>
                                                <span className="fw-bold">{tpl.name}</span>
                                            </div>
                                        </td>
                                        <td>{tpl.subject}</td>
                                        <td className="text-end pe-4">
                                            <Button variant="light" size="sm" className="me-1" onClick={() => { setEditingTemplate(tpl); setTemplateForm({ name: tpl.name, subject: tpl.subject || '', bodyHtml: tpl.bodyHtml || '', bodyText: tpl.bodyText || '' }); setShowTemplateForm(true); }}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDeleteTemplate(tpl.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {templates.length === 0 && <tr><td colSpan="3" className="text-center py-5 text-muted">{t('No templates yet.')}</td></tr>}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* New/Edit Message Modal */}
            <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingComm ? t('Edit Message') : t('New Message')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {templates.length > 0 && !editingComm && (
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Apply Template')}</Form.Label>
                            <Form.Select onChange={e => { const tpl = templates.find(t => t.id === parseInt(e.target.value)); if (tpl) applyTemplate(tpl); }}>
                                <option value="">{t('Select...')}</option>
                                {templates.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Subject')}</Form.Label>
                        <Form.Control value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Sender Name')}</Form.Label>
                                <Form.Control value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Sender Email')}</Form.Label>
                                <Form.Control type="email" value={form.senderEmail} onChange={e => setForm({ ...form, senderEmail: e.target.value })} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Segment Filter')}</Form.Label>
                        <Form.Control value={form.segmentFilter} onChange={e => setForm({ ...form, segmentFilter: e.target.value })} placeholder={t('e.g. active (leave empty for all members)')} />
                        <Form.Text className="text-muted">{t('Filter recipients by member status')}</Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Message Body (HTML)')}</Form.Label>
                        <Form.Control as="textarea" rows={8} value={form.bodyHtml} onChange={e => setForm({ ...form, bodyHtml: e.target.value })}
                            placeholder={t('Use {{name}} and {{associationName}} as placeholders')} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowForm(false)}>{t('Cancel')}</Button>
                    <Button variant="primary" onClick={handleSaveMessage} disabled={!form.subject}>{editingComm ? t('Save') : t('Create')}</Button>
                </Modal.Footer>
            </Modal>

            {/* Template Modal */}
            <Modal show={showTemplateForm} onHide={() => setShowTemplateForm(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingTemplate ? t('Edit Template') : t('New Template')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Name')}</Form.Label>
                        <Form.Control value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Subject')}</Form.Label>
                        <Form.Control value={templateForm.subject} onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Body (HTML)')}</Form.Label>
                        <Form.Control as="textarea" rows={8} value={templateForm.bodyHtml} onChange={e => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                            placeholder={t('Use {{name}} and {{associationName}} as placeholders')} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTemplateForm(false)}>{t('Cancel')}</Button>
                    <Button variant="primary" onClick={handleSaveTemplate} disabled={!templateForm.name}>{editingTemplate ? t('Save') : t('Create')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CommunicationDashboard;
