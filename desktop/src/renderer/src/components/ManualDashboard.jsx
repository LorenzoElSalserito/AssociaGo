import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, Row, Col, Spinner, ListGroup } from 'react-bootstrap';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ManualDashboard = () => {
    const { t, i18n } = useTranslation();
    const [selectedDoc, setSelectedDoc] = useState('01_intro.md');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const documents = [
        { id: '01_intro.md', title: '1. Introduzione e Dashboard' },
        { id: '02_members.md', title: '2. Gestione Soci' },
        { id: '03_activities.md', title: '3. Gestione Attività' },
        { id: '04_events.md', title: '4. Gestione Eventi' },
        { id: '05_finance.md', title: '5. Finanze e Contabilità' },
        { id: '06_assemblies.md', title: '6. Gestione Assemblee' },
        { id: '07_inventory.md', title: '7. Gestione Inventario' },
        { id: '08_volunteers.md', title: '8. Gestione Volontari' },
        { id: '09_coupons.md', title: '9. Coupon e Sconti' },
        { id: '10_settings.md', title: '10. Impostazioni' },
        { id: '11_certificates.md', title: '11. Attestati e Certificati' },
        { id: '12_budget.md', title: '12. Bilancio Preventivo' },
        { id: '13_balance.md', title: '13. Bilancio Consuntivo' },
        { id: '14_attendance.md', title: '14. Registro Presenze' },
        { id: '15_communications.md', title: '15. Comunicazioni' },
        { id: '16_signatures.md', title: '16. Firme Istituzionali' },
        { id: '17_notifications.md', title: '17. Notifiche' },
        { id: '18_compliance.md', title: '18. Conformità e Audit' }
    ];

    useEffect(() => {
        loadDocument(selectedDoc);
    }, [selectedDoc, i18n.language]);

    const loadDocument = async (filename) => {
        setLoading(true);
        try {
            const lang = i18n.language || 'it';

            // Try to fetch localized version first
            let response = await fetch(`/docs/${lang}/${filename}`);

            // Fallback to Italian (in 'it' folder) if localized version not found
            if (!response.ok) {
                response = await fetch(`/docs/it/${filename}`);
            }

            // Fallback to English if Italian not found (unlikely but safe)
            if (!response.ok) {
                 response = await fetch(`/docs/en/${filename}`);
            }

            if (!response.ok) throw new Error("Document not found");

            const text = await response.text();
            setContent(text);
        } catch (error) {
            console.error("Error loading doc:", error);
            setContent(`# ${t('Error')}\n${t('Unable to load document.')}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48 }}>
                    <BookOpen size={24} />
                </div>
                <div>
                    <h4 className="mb-0 fw-bold">{t('User Manual')}</h4>
                    <p className="text-muted mb-0 small">{t('Complete guide to AssociaGo features')}</p>
                </div>
            </div>

            <Row>
                <Col md={3} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {documents.map((doc) => (
                                    <ListGroup.Item
                                        key={doc.id}
                                        action
                                        active={selectedDoc === doc.id}
                                        onClick={() => setSelectedDoc(doc.id)}
                                        className="border-0 py-3 px-4 d-flex justify-content-between align-items-center"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className={selectedDoc === doc.id ? 'fw-bold' : ''}>
                                            {t(doc.title)}
                                        </span>
                                        {selectedDoc === doc.id && <ChevronRight size={16} />}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={9}>
                    <Card className="border-0 shadow-sm min-vh-100">
                        <Card.Body className="p-5">
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <div className="markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .markdown-body h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
                .markdown-body h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: var(--text-color); }
                .markdown-body h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--text-muted); }
                .markdown-body p { margin-bottom: 1rem; line-height: 1.6; color: var(--text-color); }
                .markdown-body ul, .markdown-body ol { margin-bottom: 1rem; padding-left: 1.5rem; color: var(--text-color); }
                .markdown-body li { margin-bottom: 0.5rem; }
                .markdown-body strong { font-weight: 600; color: var(--text-color); }
                .markdown-body blockquote { border-left: 4px solid var(--primary-color); padding-left: 1rem; color: var(--text-muted); font-style: italic; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
};

export default ManualDashboard;
