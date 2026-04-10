import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner, Image } from 'react-bootstrap';
import { Upload, Trash2, Save, PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const ROLES = [
    { key: 'PRESIDENT', titleKey: 'President' },
    { key: 'SECRETARY', titleKey: 'Secretary' },
    { key: 'TREASURER', titleKey: 'Treasurer' },
];

const SignaturePanel = ({ associationId }) => {
    const { t } = useTranslation();
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [imageUrls, setImageUrls] = useState({});

    useEffect(() => {
        if (associationId) loadSignatures();
    }, [associationId]);

    const loadSignatures = async () => {
        setLoading(true);
        try {
            const data = await associago.signatures.getAll(associationId);
            setSignatures(data || []);
            const urls = {};
            for (const sig of (data || [])) {
                if (sig.signatureImage || sig.signatureMimeType) {
                    urls[sig.id] = await associago.signatures.getImageUrl(sig.id);
                }
            }
            setImageUrls(urls);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (role, name, title) => {
        try {
            await associago.signatures.upsert({
                associationId,
                signerRole: role,
                signerName: name,
                signerTitle: title,
            });
            setMessage({ type: 'success', text: t('Signature saved successfully.') });
            loadSignatures();
        } catch (e) {
            setMessage({ type: 'danger', text: e.message });
        }
    };

    const handleUploadImage = async (sigId, file) => {
        try {
            await associago.signatures.uploadImage(sigId, file);
            setMessage({ type: 'success', text: t('Signature image uploaded.') });
            loadSignatures();
        } catch (e) {
            setMessage({ type: 'danger', text: e.message });
        }
    };

    const handleDeleteImage = async (sigId) => {
        try {
            await associago.signatures.deleteImage(sigId);
            setMessage({ type: 'success', text: t('Signature image removed.') });
            loadSignatures();
        } catch (e) {
            setMessage({ type: 'danger', text: e.message });
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div>
            <Alert variant="info" className="mb-4 small">
                <PenTool size={16} className="me-2" />
                {t('Remember to configure institutional signatures for president, secretary and treasurer before generating balances, certificates and official documents.')}
            </Alert>
            {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="small">{message.text}</Alert>}

            <Row className="g-4">
                {ROLES.map(role => {
                    const sig = signatures.find(s => s.signerRole === role.key);
                    return (
                        <Col md={4} key={role.key}>
                            <SignatureCard
                                role={role}
                                signature={sig}
                                imageUrl={sig ? imageUrls[sig.id] : null}
                                onSave={handleSave}
                                onUploadImage={handleUploadImage}
                                onDeleteImage={handleDeleteImage}
                                t={t}
                            />
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

const SignatureCard = ({ role, signature, imageUrl, onSave, onUploadImage, onDeleteImage, t }) => {
    const [name, setName] = useState(signature?.signerName || '');
    const [title, setTitle] = useState(signature?.signerTitle || t(role.titleKey));
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setName(signature?.signerName || '');
        setTitle(signature?.signerTitle || t(role.titleKey));
        setDirty(false);
    }, [signature]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && signature?.id) {
            onUploadImage(signature.id, file);
        }
    };

    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
                <h6 className="mb-0">{t(role.titleKey)}</h6>
            </Card.Header>
            <Card.Body>
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">{t('Name')}</Form.Label>
                    <Form.Control
                        size="sm"
                        value={name}
                        onChange={e => { setName(e.target.value); setDirty(true); }}
                        placeholder={t(role.titleKey)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">{t('Title')}</Form.Label>
                    <Form.Control
                        size="sm"
                        value={title}
                        onChange={e => { setTitle(e.target.value); setDirty(true); }}
                    />
                </Form.Group>

                {dirty && (
                    <Button variant="primary" size="sm" className="mb-3 w-100" onClick={() => { onSave(role.key, name, title); setDirty(false); }}>
                        <Save size={14} className="me-1" /> {t('Save')}
                    </Button>
                )}

                <div className="border rounded p-3 text-center bg-light" style={{ minHeight: 100 }}>
                    {imageUrl ? (
                        <div>
                            <Image src={imageUrl + '?t=' + Date.now()} fluid style={{ maxHeight: 80 }} className="mb-2" />
                            <div>
                                <Button variant="outline-danger" size="sm" onClick={() => onDeleteImage(signature.id)}>
                                    <Trash2 size={14} className="me-1" /> {t('Delete')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted small">
                            <PenTool size={24} className="mb-2 opacity-25" />
                            <p className="mb-0">{t('No signature image')}</p>
                        </div>
                    )}
                </div>

                {signature?.id && (
                    <div className="mt-2">
                        <Form.Label className="small fw-bold">{t('Upload signature image')}</Form.Label>
                        <Form.Control type="file" size="sm" accept="image/png,image/jpeg" onChange={handleFileChange} />
                        <Form.Text className="text-muted">{t('PNG or JPG, transparent background recommended')}</Form.Text>
                    </div>
                )}

                {!signature?.id && name && (
                    <p className="text-muted small mt-2">{t('Save the name first, then upload the signature image.')}</p>
                )}
            </Card.Body>
        </Card>
    );
};

export default SignaturePanel;
