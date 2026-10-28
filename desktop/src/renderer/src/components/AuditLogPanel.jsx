import { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { History, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const AUDIT_AREAS = ['MEMBERS', 'FINANCE', 'ACTIVITIES', 'EVENTS', 'ASSEMBLIES', 'INVENTORY', 'VOLUNTEERS', 'COUPONS',
    'BUDGET', 'BALANCE', 'CERTIFICATES', 'COMMUNICATIONS', 'ASSOCIATION', 'SETTINGS', 'SIGNATURES'];
const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE'];
const PAGE_SIZE = 25;
const ACTION_TONE = { CREATE: 'success', UPDATE: 'info', DELETE: 'danger' };
const EMPTY_FILTERS = { area: '', action: '', from: '', to: '' };

const actionStyle = (action) => {
    const tone = ACTION_TONE[action] || 'info';
    return {
        color: `var(--${tone}-color)`,
        background: `rgba(var(--${tone}-rgb), 0.12)`,
        border: '1px solid currentColor',
        borderRadius: 'var(--btn-border-radius)',
        padding: '0.1rem 0.5rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
    };
};

const AuditLogPanel = ({ associationId }) => {
    const { t, i18n } = useTranslation();
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(0);
    const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!associationId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await associago.audit.search(associationId, { ...filters, page, size: PAGE_SIZE });
            const meta = res?.page || res || {};
            setData({
                content: res?.content || [],
                totalPages: meta.totalPages || 0,
                totalElements: meta.totalElements || 0,
            });
        } catch (e) {
            setError(e.message || t('auditLog.error'));
        } finally {
            setLoading(false);
        }
    }, [associationId, filters, page, t]);

    useEffect(() => { load(); }, [load]);

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0);
    };

    const hasFilters = Object.values(filters).some(Boolean);
    const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'medium' });
    };
    const label = (prefix, key) => (key ? t(`auditLog.${prefix}.${key}`, { defaultValue: key }) : '—');

    return (
        <div>
            <div className="d-flex align-items-start gap-2 mb-3">
                <History size={20} className="text-muted mt-1 flex-shrink-0" aria-hidden="true" />
                <div>
                    <h5 className="fw-bold mb-1">{t('auditLog.title')}</h5>
                    <p className="text-muted small mb-0">{t('auditLog.intro')}</p>
                </div>
            </div>

            <Form onSubmit={e => e.preventDefault()} aria-label={t('auditLog.filters')}>
                <Row className="g-2 align-items-end mb-3">
                    <Col xs={12} sm={6} lg={3}>
                        <Form.Group controlId="audit-area">
                            <Form.Label className="small fw-semibold mb-1">{t('auditLog.col.area')}</Form.Label>
                            <Form.Select size="sm" value={filters.area} onChange={e => setFilter('area', e.target.value)}>
                                <option value="">{t('auditLog.all')}</option>
                                {AUDIT_AREAS.map(a => <option key={a} value={a}>{label('area', a)}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} lg={2}>
                        <Form.Group controlId="audit-action">
                            <Form.Label className="small fw-semibold mb-1">{t('auditLog.col.action')}</Form.Label>
                            <Form.Select size="sm" value={filters.action} onChange={e => setFilter('action', e.target.value)}>
                                <option value="">{t('auditLog.all')}</option>
                                {AUDIT_ACTIONS.map(a => <option key={a} value={a}>{label('action', a)}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={6} lg={2}>
                        <Form.Group controlId="audit-from">
                            <Form.Label className="small fw-semibold mb-1">{t('auditLog.from')}</Form.Label>
                            <Form.Control size="sm" type="date" value={filters.from} max={filters.to || undefined}
                                onChange={e => setFilter('from', e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col xs={6} lg={2}>
                        <Form.Group controlId="audit-to">
                            <Form.Label className="small fw-semibold mb-1">{t('auditLog.to')}</Form.Label>
                            <Form.Control size="sm" type="date" value={filters.to} min={filters.from || undefined}
                                onChange={e => setFilter('to', e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col xs={12} lg={3} className="d-flex gap-2 justify-content-lg-end">
                        <Button size="sm" variant="outline-secondary" disabled={!hasFilters}
                            onClick={() => { setFilters(EMPTY_FILTERS); setPage(0); }}>
                            <RotateCcw size={14} className="me-1" aria-hidden="true" />{t('auditLog.reset')}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {error && (
                <Alert variant="danger" className="small d-flex align-items-center justify-content-between gap-2">
                    <span>{t('auditLog.error')}</span>
                    <Button size="sm" variant="outline-danger" onClick={load}>{t('auditLog.retry')}</Button>
                </Alert>
            )}

            <div aria-live="polite" aria-busy={loading}>
                {loading ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" variant="primary" role="status">
                            <span className="visually-hidden">{t('auditLog.loading')}</span>
                        </Spinner>
                    </div>
                ) : !error && data.content.length === 0 ? (
                    <div className="text-center text-muted p-5 border rounded">
                        <History size={28} className="mb-2" aria-hidden="true" />
                        <p className="mb-0 small">{t(hasFilters ? 'auditLog.emptyFiltered' : 'auditLog.empty')}</p>
                    </div>
                ) : !error && (
                    <Table responsive hover size="sm" className="mb-2 align-middle">
                        <caption className="visually-hidden">{t('auditLog.title')}</caption>
                        <thead>
                            <tr>
                                <th scope="col">{t('auditLog.col.date')}</th>
                                <th scope="col">{t('auditLog.col.area')}</th>
                                <th scope="col">{t('auditLog.col.action')}</th>
                                <th scope="col">{t('auditLog.col.record')}</th>
                                <th scope="col">{t('auditLog.col.summary')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.content.map(entry => (
                                <tr key={entry.id}>
                                    <td className="text-nowrap small">{formatDate(entry.createdAt)}</td>
                                    <td className="small">{label('area', entry.area)}</td>
                                    <td><span style={actionStyle(entry.action)}>{label('action', entry.action)}</span></td>
                                    <td className="small text-nowrap">
                                        {label('entity', entry.entityType)}{entry.entityId != null && <span className="text-muted"> #{entry.entityId}</span>}
                                    </td>
                                    <td className="small text-break">
                                        {entry.action === 'UPDATE' && entry.description
                                            ? t('auditLog.changedFields', { fields: entry.description })
                                            : <span className="text-muted">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            {!loading && !error && data.content.length > 0 && (
                <nav className="d-flex align-items-center justify-content-between gap-2 flex-wrap" aria-label={t('auditLog.pagination')}>
                    <span className="small text-muted">{t('auditLog.total', { count: data.totalElements })}</span>
                    {data.totalPages > 1 && <div className="d-flex align-items-center gap-2">
                        <Button size="sm" variant="outline-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}
                            aria-label={t('auditLog.prev')}>
                            <ChevronLeft size={16} aria-hidden="true" />
                        </Button>
                        <span className="small">{t('auditLog.page', { page: page + 1, total: data.totalPages })}</span>
                        <Button size="sm" variant="outline-secondary" disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)}
                            aria-label={t('auditLog.next')}>
                            <ChevronRight size={16} aria-hidden="true" />
                        </Button>
                    </div>}
                </nav>
            )}
        </div>
    );
};

export default AuditLogPanel;
