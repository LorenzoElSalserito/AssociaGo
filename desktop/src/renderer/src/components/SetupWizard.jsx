import React, { useState } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import { Database, CheckCircle, Server, ArrowRight } from 'lucide-react';

const SetupWizard = ({ onConfigured }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [dbType, setDbType] = useState('sqlite');
    const [config, setConfig] = useState({
        host: 'localhost',
        port: 3306,
        database: 'associago',
        username: 'root',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleNext = () => {
        if (step === 1) {
            if (dbType === 'sqlite') {
                handleFinish();
            } else {
                setStep(2);
            }
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = await associago.getApiUrl();
            const payload = {
                dbType: dbType.toUpperCase(), // Backend expects uppercase
                dbHost: config.host,
                dbPort: config.port.toString(),
                dbName: config.database,
                dbUser: config.username,
                dbPassword: config.password
            };

            const response = await fetch(`${baseUrl}/setup/configure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onConfigured();
            } else {
                const err = await response.json();
                setError(err.message || 'Configuration failed');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <Card className="border-0 shadow-lg" style={{ width: '500px' }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-5">
                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
                            <Database size={32} />
                        </div>
                        <h3 className="fw-bold">{t('Welcome to AssociaGo')}</h3>
                        <p className="text-muted">{t('Let\'s set up your database connection')}</p>
                    </div>

                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                    {step === 1 && (
                        <div className="fade-in">
                            <h5 className="mb-3">{t('Choose Database Type')}</h5>
                            <div className="d-grid gap-3 mb-4">
                                <div
                                    className={`p-3 border rounded cursor-pointer d-flex align-items-center ${dbType === 'sqlite' ? 'border-primary bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                    onClick={() => setDbType('sqlite')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Database size={24} className={`me-3 ${dbType === 'sqlite' ? 'text-primary' : 'text-muted'}`} />
                                    <div>
                                        <div className="fw-bold">{t('Local Database (SQLite)')}</div>
                                        <small className="text-muted">{t('Best for single-user or offline use')}</small>
                                    </div>
                                    {dbType === 'sqlite' && <CheckCircle size={20} className="ms-auto text-primary" />}
                                </div>

                                <div
                                    className={`p-3 border rounded cursor-pointer d-flex align-items-center ${dbType === 'mariadb' ? 'border-primary bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                    onClick={() => setDbType('mariadb')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Server size={24} className={`me-3 ${dbType === 'mariadb' ? 'text-primary' : 'text-muted'}`} />
                                    <div>
                                        <div className="fw-bold">{t('Remote Database (MariaDB)')}</div>
                                        <small className="text-muted">{t('Best for multi-user teams')}</small>
                                    </div>
                                    {dbType === 'mariadb' && <CheckCircle size={20} className="ms-auto text-primary" />}
                                </div>
                            </div>
                            <Button variant="primary" className="w-100 py-2" onClick={handleNext} disabled={loading}>
                                {loading ? <Spinner size="sm" animation="border" /> : (
                                    <>
                                        {dbType === 'sqlite' ? t('Finish Setup') : t('Next Step')}
                                        {dbType !== 'sqlite' && <ArrowRight size={18} className="ms-2" />}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="fade-in">
                            <h5 className="mb-3">{t('Database Configuration')}</h5>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('Host')}</Form.Label>
                                    <Form.Control
                                        value={config.host}
                                        onChange={(e) => setConfig({...config, host: e.target.value})}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('Port')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={config.port}
                                        onChange={(e) => setConfig({...config, port: parseInt(e.target.value)})}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('Database Name')}</Form.Label>
                                    <Form.Control
                                        value={config.database}
                                        onChange={(e) => setConfig({...config, database: e.target.value})}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('Username')}</Form.Label>
                                    <Form.Control
                                        value={config.username}
                                        onChange={(e) => setConfig({...config, username: e.target.value})}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>{t('Password')}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={config.password}
                                        onChange={(e) => setConfig({...config, password: e.target.value})}
                                    />
                                </Form.Group>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-secondary" className="w-50" onClick={() => setStep(1)}>
                                        {t('Back')}
                                    </Button>
                                    <Button variant="primary" className="w-50" onClick={handleFinish} disabled={loading}>
                                        {loading ? <Spinner size="sm" animation="border" /> : t('Connect')}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default SetupWizard;
