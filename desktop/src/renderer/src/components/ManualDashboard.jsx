import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, Row, Col, Spinner, ListGroup } from 'react-bootstrap';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchManualDocument } from './manualLoader.mjs';

const ManualDashboard = () => {
    const { t, i18n } = useTranslation();
    const [selectedDoc, setSelectedDoc] = useState('01_intro.md');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Chapter titles live in the locale dictionaries (manual.chapters.cNN).
    const documents = [
        { id: '01_intro.md', title: 'manual.chapters.c01' },
        { id: '02_members.md', title: 'manual.chapters.c02' },
        { id: '03_activities.md', title: 'manual.chapters.c03' },
        { id: '04_events.md', title: 'manual.chapters.c04' },
        { id: '05_finance.md', title: 'manual.chapters.c05' },
        { id: '06_assemblies.md', title: 'manual.chapters.c06' },
        { id: '07_inventory.md', title: 'manual.chapters.c07' },
        { id: '08_volunteers.md', title: 'manual.chapters.c08' },
        { id: '09_coupons.md', title: 'manual.chapters.c09' },
        { id: '10_settings.md', title: 'manual.chapters.c10' },
        { id: '11_certificates.md', title: 'manual.chapters.c11' },
        { id: '12_budget.md', title: 'manual.chapters.c12' },
        { id: '13_balance.md', title: 'manual.chapters.c13' },
        { id: '14_attendance.md', title: 'manual.chapters.c14' },
        { id: '15_communications.md', title: 'manual.chapters.c15' },
        { id: '16_signatures.md', title: 'manual.chapters.c16' },
        { id: '17_notifications.md', title: 'manual.chapters.c17' },
        { id: '18_compliance.md', title: 'manual.chapters.c18' }
    ];

    useEffect(() => {
        loadDocument(selectedDoc);
    }, [selectedDoc, i18n.language]);

    const loadDocument = async (filename) => {
        setLoading(true);
        try {
            const text = await fetchManualDocument(
                fetch,
                document.baseURI,
                i18n.language,
                filename
            );
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
                                        aria-current={selectedDoc === doc.id ? 'page' : undefined}
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
                        <Card.Body className="p-4 p-lg-5">
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <div className="markdown-body fade-in" key={`${selectedDoc}-${i18n.language}`}>
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
                .markdown-body { max-width: 860px; overflow-wrap: anywhere; }
                .markdown-body a { color: var(--primary-color); }
                .markdown-body code { background: var(--surface-muted); color: var(--text-color); padding: .1rem .35rem; border-radius: 4px; font-size: .875em; }
                .markdown-body kbd { background: var(--surface-muted); color: var(--text-color); border: 1px solid var(--border-color); border-bottom-width: 2px; border-radius: 4px; padding: .05rem .4rem; font-size: .8125em; }
                .markdown-body hr { border-color: var(--border-color); opacity: 1; margin: 2rem 0; }
                .markdown-body table { display: block; overflow-x: auto; width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; font-size: .9rem; }
                .markdown-body th, .markdown-body td { border: 1px solid var(--border-color); padding: .55rem .8rem; text-align: left; vertical-align: top; }
                .markdown-body th { background: var(--surface-muted); font-weight: 600; }
            `}</style>
        </div>
    );
};

export default ManualDashboard;
