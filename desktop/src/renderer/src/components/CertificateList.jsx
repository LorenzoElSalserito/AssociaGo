import { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Badge, Spinner, Row, Col, Modal, Form, Nav, Tab } from 'react-bootstrap';
import { Plus, Trash2, Download, Award, FileText, Edit, Eye, Type, Layout, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import { translateCertificateType } from '../utils/enumTranslations';

const MERGE_FIELDS = [
    '{{firstName}}', '{{lastName}}', '{{fiscalCode}}',
    '{{associationName}}', '{{date}}',
    '{{activityName}}', '{{activityCategory}}',
    '{{eventName}}', '{{eventType}}'
];

const SIGNATORY_ROLES = ['PRESIDENT', 'SECRETARY', 'TREASURER'];

const DEFAULT_TEMPLATE_FORM = {
    name: '', type: 'PARTICIPATION', bodyHtml: '',
    orientation: 'LANDSCAPE', paperSize: 'A4',
    signatoryRoles: '["PRESIDENT"]', mergeFields: '',
    active: true
};

const SAMPLE_DATA = {
    '{{firstName}}': 'Mario',
    '{{lastName}}': 'Rossi',
    '{{fiscalCode}}': 'RSSMRA80A01H501U',
    '{{associationName}}': 'Associazione Esempio',
    '{{date}}': new Date().toLocaleDateString('it-IT'),
    '{{activityName}}': 'Corso Base',
    '{{activityCategory}}': 'Formazione',
    '{{eventName}}': 'Assemblea Annuale',
    '{{eventType}}': 'ASSEMBLY'
};

const CertificateList = ({ associationId }) => {
    const { t } = useTranslation();
    const bodyRef = useRef(null);
    const [tab, setTab] = useState('templates');
    const [templates, setTemplates] = useState([]);
    const [issued, setIssued] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [showIssueForm, setShowIssueForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({ ...DEFAULT_TEMPLATE_FORM, associationId });
    const [issueForm, setIssueForm] = useState({ templateId: '', memberId: '', activityId: '', eventId: '' });
    const [activities, setActivities] = useState([]);
    const [events, setEvents] = useState([]);
    const [formTab, setFormTab] = useState('general');

    useEffect(() => {
        if (associationId) fetchData();
    }, [associationId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tpls, iss] = await Promise.all([
                associago.certificates.getTemplates(associationId),
                associago.certificates.getIssued(associationId)
            ]);
            setTemplates(tpls || []);
            setIssued(iss || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchActivitiesAndEvents = async () => {
        try {
            const [acts, evts] = await Promise.all([
                associago.activities.getAll(associationId),
                associago.events.getAll()
            ]);
            setActivities(acts || []);
            setEvents(evts || []);
        } catch (e) { console.error(e); }
    };

    const handleSaveTemplate = async () => {
        try {
            const payload = {
                ...templateForm,
                associationId
            };
            if (editingTemplate) {
                await associago.certificates.updateTemplate(editingTemplate.id, payload);
            } else {
                await associago.certificates.createTemplate(payload);
            }
            setShowTemplateForm(false);
            setEditingTemplate(null);
            setTemplateForm({ ...DEFAULT_TEMPLATE_FORM, associationId });
            setFormTab('general');
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleDeleteTemplate = async (id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            await associago.certificates.deleteTemplate(id);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleIssue = async () => {
        try {
            const params = { templateId: issueForm.templateId, associationId };
            if (issueForm.memberId) params.userId = issueForm.memberId;
            await associago.certificates.issue(params);
            setShowIssueForm(false);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleBatchActivity = async (activityId, templateId) => {
        try {
            await associago.certificates.batchActivity(activityId, templateId, associationId);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleBatchEvent = async (eventId, templateId) => {
        try {
            await associago.certificates.batchEvent(eventId, templateId, associationId);
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleDownloadPdf = async (id) => {
        try {
            const blob = await associago.certificates.downloadPdf(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate_${id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) { alert(e.message); }
    };

    const insertMergeField = (field) => {
        const textarea = bodyRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = templateForm.bodyHtml;
        const newText = text.substring(0, start) + field + text.substring(end);
        setTemplateForm({ ...templateForm, bodyHtml: newText });
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + field.length;
        }, 0);
    };

    const toggleSignatoryRole = (role) => {
        let roles = [];
        try { roles = JSON.parse(templateForm.signatoryRoles || '[]'); } catch (e) { roles = []; }
        if (roles.includes(role)) {
            roles = roles.filter(r => r !== role);
        } else {
            roles.push(role);
        }
        setTemplateForm({ ...templateForm, signatoryRoles: JSON.stringify(roles) });
    };

    const getSignatoryRoles = () => {
        try { return JSON.parse(templateForm.signatoryRoles || '[]'); } catch (e) { return []; }
    };

    const getPreviewHtml = () => {
        let html = templateForm.bodyHtml || '';
        for (const [key, val] of Object.entries(SAMPLE_DATA)) {
            html = html.replaceAll(key, `<strong style="color:#0d6efd">${val}</strong>`);
        }
        return html;
    };

    const openEditTemplate = (tpl) => {
        setEditingTemplate(tpl);
        setTemplateForm({
            name: tpl.name || '',
            type: tpl.type || 'PARTICIPATION',
            bodyHtml: tpl.bodyHtml || '',
            orientation: tpl.orientation || 'LANDSCAPE',
            paperSize: tpl.paperSize || 'A4',
            signatoryRoles: tpl.signatoryRoles || '["PRESIDENT"]',
            mergeFields: tpl.mergeFields || '',
            active: tpl.active !== false
        });
        setFormTab('general');
        setShowTemplateForm(true);
    };

    const openNewTemplate = () => {
        setEditingTemplate(null);
        setTemplateForm({ ...DEFAULT_TEMPLATE_FORM, associationId });
        setFormTab('general');
        setShowTemplateForm(true);
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">{t('Certificates')}</h2>
                    <p className="text-muted mb-0">{t('Templates and issued certificates')}</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={openNewTemplate}>
                        <Plus size={18} className="me-1" />{t('New Template')}
                    </Button>
                    <Button variant="primary" onClick={() => { fetchActivitiesAndEvents(); setShowIssueForm(true); }}>
                        <Award size={18} className="me-1" />{t('Issue Certificate')}
                    </Button>
                </div>
            </div>

            <Nav variant="tabs" className="mb-3">
                <Nav.Item><Nav.Link active={tab === 'templates'} onClick={() => setTab('templates')}>{t('Templates')}</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link active={tab === 'issued'} onClick={() => setTab('issued')}>{t('Issued')} <Badge bg="secondary" className="ms-1">{issued.length}</Badge></Nav.Link></Nav.Item>
            </Nav>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                    ) : tab === 'templates' ? (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Template Name')}</th>
                                    <th className="border-0">{t('Type')}</th>
                                    <th className="border-0">{t('Layout')}</th>
                                    <th className="border-0">{t('Status')}</th>
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
                                        <td><Badge bg="info" className="fw-normal">{translateCertificateType(tpl.type, t)}</Badge></td>
                                        <td><span className="text-muted small">{tpl.orientation || 'LANDSCAPE'} / {tpl.paperSize || 'A4'}</span></td>
                                        <td><Badge bg={tpl.active !== false ? 'success' : 'secondary'}>{tpl.active !== false ? t('Active') : t('Inactive')}</Badge></td>
                                        <td className="text-end pe-4">
                                            <Button variant="light" size="sm" className="me-1" onClick={() => openEditTemplate(tpl)}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDeleteTemplate(tpl.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {templates.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">{t('No templates yet.')}</td></tr>
                                )}
                            </tbody>
                        </Table>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 ps-4">{t('Certificate')}</th>
                                    <th className="border-0">{t('Recipient')}</th>
                                    <th className="border-0">{t('Issued At')}</th>
                                    <th className="border-0 text-end pe-4">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issued.map(cert => (
                                    <tr key={cert.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
                                                    <Award size={20} />
                                                </div>
                                                <span className="fw-bold">{cert.certificateNumber || `#${cert.id}`}</span>
                                            </div>
                                        </td>
                                        <td>{t('certificates.recipientFallback', { id: cert.userId })}</td>
                                        <td>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('it-IT') : '-'}</td>
                                        <td className="text-end pe-4">
                                            <Button variant="light" size="sm" onClick={() => handleDownloadPdf(cert.id)}>
                                                <Download size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {issued.length === 0 && (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">{t('No certificates issued yet.')}</td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* ===== TEMPLATE FORM MODAL (Enhanced) ===== */}
            <Modal show={showTemplateForm} onHide={() => setShowTemplateForm(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingTemplate ? t('Edit Template') : t('New Template')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        {/* Left: Form Tabs */}
                        <Col md={7}>
                            <Nav variant="pills" className="mb-3 gap-1">
                                <Nav.Item>
                                    <Nav.Link active={formTab === 'general'} onClick={() => setFormTab('general')} className="d-flex align-items-center gap-1 px-3 py-2">
                                        <FileText size={14} /> {t('General')}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link active={formTab === 'body'} onClick={() => setFormTab('body')} className="d-flex align-items-center gap-1 px-3 py-2">
                                        <Type size={14} /> {t('Body')}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link active={formTab === 'layout'} onClick={() => setFormTab('layout')} className="d-flex align-items-center gap-1 px-3 py-2">
                                        <Layout size={14} /> {t('Layout')}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link active={formTab === 'signatories'} onClick={() => setFormTab('signatories')} className="d-flex align-items-center gap-1 px-3 py-2">
                                        <Users size={14} /> {t('Signatories')}
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            {/* TAB: General */}
                            {formTab === 'general' && (
                                <div>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">{t('Name')}</Form.Label>
                                        <Form.Control value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder={t('Template name...')} />
                                    </Form.Group>
                                    <Row>
                                        <Col md={8}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold">{t('Type')}</Form.Label>
                                                <Form.Select value={templateForm.type} onChange={e => setTemplateForm({ ...templateForm, type: e.target.value })}>
                                                    <option value="PARTICIPATION">{t('Participation')}</option>
                                                    <option value="ATTENDANCE">{t('Attendance')}</option>
                                                    <option value="TRAINING">{t('Training')}</option>
                                                    <option value="MEMBERSHIP">{t('Membership')}</option>
                                                    <option value="CUSTOM">{t('Custom')}</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="d-flex align-items-end mb-3">
                                            <Form.Check
                                                type="switch"
                                                id="templateActive"
                                                label={t('Active')}
                                                checked={templateForm.active}
                                                onChange={e => setTemplateForm({ ...templateForm, active: e.target.checked })}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* TAB: Body with Merge Fields */}
                            {formTab === 'body' && (
                                <div>
                                    <Form.Label className="fw-semibold">{t('Body Template')}</Form.Label>
                                    <div className="mb-2 d-flex flex-wrap gap-1">
                                        {MERGE_FIELDS.map(field => (
                                            <Button key={field} variant="outline-secondary" size="sm"
                                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                                onClick={() => insertMergeField(field)}
                                                title={t('Insert field')}>
                                                {field}
                                            </Button>
                                        ))}
                                    </div>
                                    <Form.Control
                                        as="textarea"
                                        ref={bodyRef}
                                        rows={12}
                                        value={templateForm.bodyHtml}
                                        onChange={e => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                                        placeholder={t('Write the certificate body text. Click the buttons above to insert merge fields...')}
                                        style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                                    />
                                    <Form.Text className="text-muted">
                                        {t('Merge fields will be replaced with actual member and event data when the certificate is generated.')}
                                    </Form.Text>
                                </div>
                            )}

                            {/* TAB: Layout */}
                            {formTab === 'layout' && (
                                <div>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">{t('Orientation')}</Form.Label>
                                        <div className="d-flex gap-3">
                                            <Form.Check
                                                type="radio"
                                                id="orientLandscape"
                                                name="orientation"
                                                label={t('Landscape')}
                                                checked={templateForm.orientation === 'LANDSCAPE'}
                                                onChange={() => setTemplateForm({ ...templateForm, orientation: 'LANDSCAPE' })}
                                            />
                                            <Form.Check
                                                type="radio"
                                                id="orientPortrait"
                                                name="orientation"
                                                label={t('Portrait')}
                                                checked={templateForm.orientation === 'PORTRAIT'}
                                                onChange={() => setTemplateForm({ ...templateForm, orientation: 'PORTRAIT' })}
                                            />
                                        </div>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">{t('Paper Size')}</Form.Label>
                                        <Form.Select value={templateForm.paperSize} onChange={e => setTemplateForm({ ...templateForm, paperSize: e.target.value })} style={{ maxWidth: 200 }}>
                                            <option value="A4">A4</option>
                                            <option value="A3">A3</option>
                                            <option value="LETTER">Letter</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            )}

                            {/* TAB: Signatories */}
                            {formTab === 'signatories' && (
                                <div>
                                    <Form.Label className="fw-semibold mb-3">{t('Signatory Roles')}</Form.Label>
                                    <p className="text-muted small mb-3">{t('Select which institutional roles should sign this certificate.')}</p>
                                    {SIGNATORY_ROLES.map(role => (
                                        <Form.Check
                                            key={role}
                                            type="checkbox"
                                            id={`sig-${role}`}
                                            label={t(role.charAt(0) + role.slice(1).toLowerCase())}
                                            checked={getSignatoryRoles().includes(role)}
                                            onChange={() => toggleSignatoryRole(role)}
                                            className="mb-2"
                                        />
                                    ))}
                                </div>
                            )}
                        </Col>

                        {/* Right: Live Preview */}
                        <Col md={5}>
                            <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-tertiary-bg)', minHeight: 300 }}>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <Eye size={16} className="text-muted" />
                                    <span className="fw-semibold text-muted small text-uppercase">{t('Preview')}</span>
                                </div>
                                <div
                                    className="bg-white border rounded p-3 shadow-sm"
                                    style={{
                                        aspectRatio: templateForm.orientation === 'LANDSCAPE' ? '297/210' : '210/297',
                                        maxHeight: 400,
                                        overflow: 'auto',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.5
                                    }}
                                >
                                    <div className="text-center mb-2">
                                        <strong style={{ fontSize: '1rem' }}>{templateForm.name || t('Certificate Title')}</strong>
                                    </div>
                                    <hr style={{ margin: '0.5rem 0' }} />
                                    <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() || `<span class="text-muted">${t('Certificate body will appear here...')}</span>` }} />
                                    {getSignatoryRoles().length > 0 && (
                                        <div className="mt-3 pt-2 border-top d-flex justify-content-around">
                                            {getSignatoryRoles().map(role => (
                                                <div key={role} className="text-center">
                                                    <div className="border-bottom mb-1" style={{ width: 80, margin: '0 auto' }}>&nbsp;</div>
                                                    <small className="text-muted">{t(role.charAt(0) + role.slice(1).toLowerCase())}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 d-flex justify-content-between">
                                    <small className="text-muted">{templateForm.orientation} / {templateForm.paperSize}</small>
                                    <Badge bg={templateForm.active ? 'success' : 'secondary'} className="small">
                                        {templateForm.active ? t('Active') : t('Inactive')}
                                    </Badge>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTemplateForm(false)}>{t('Cancel')}</Button>
                    <Button variant="primary" onClick={handleSaveTemplate} disabled={!templateForm.name}>
                        {editingTemplate ? t('Save') : t('Create')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ===== ISSUE FORM MODAL ===== */}
            <Modal show={showIssueForm} onHide={() => setShowIssueForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('Issue Certificate')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Template')}</Form.Label>
                        <Form.Select value={issueForm.templateId} onChange={e => setIssueForm({ ...issueForm, templateId: e.target.value })}>
                            <option value="">{t('Select template...')}</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Member ID')}</Form.Label>
                        <Form.Control type="number" value={issueForm.memberId} onChange={e => setIssueForm({ ...issueForm, memberId: e.target.value })} />
                    </Form.Group>
                    <hr />
                    <p className="text-muted small">{t('Or issue in batch for all participants:')}</p>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Activity')}</Form.Label>
                                <Form.Select value={issueForm.activityId} onChange={e => setIssueForm({ ...issueForm, activityId: e.target.value })}>
                                    <option value="">{t('Select...')}</option>
                                    {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                            {issueForm.activityId && issueForm.templateId && (
                                <Button variant="outline-primary" size="sm" onClick={() => handleBatchActivity(issueForm.activityId, issueForm.templateId)}>
                                    {t('Batch Issue for Activity')}
                                </Button>
                            )}
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Event')}</Form.Label>
                                <Form.Select value={issueForm.eventId} onChange={e => setIssueForm({ ...issueForm, eventId: e.target.value })}>
                                    <option value="">{t('Select...')}</option>
                                    {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                            {issueForm.eventId && issueForm.templateId && (
                                <Button variant="outline-primary" size="sm" onClick={() => handleBatchEvent(issueForm.eventId, issueForm.templateId)}>
                                    {t('Batch Issue for Event')}
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowIssueForm(false)}>{t('Cancel')}</Button>
                    <Button variant="primary" onClick={handleIssue} disabled={!issueForm.templateId || !issueForm.memberId}>{t('Issue')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CertificateList;
