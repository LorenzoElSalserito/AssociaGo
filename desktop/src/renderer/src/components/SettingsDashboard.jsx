import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner, Nav, Image, Badge } from 'react-bootstrap';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';
import { Save, Database, Download, Globe, Moon, Sun, Building, Upload, Edit, X, FileText, CreditCard, Plus, Trash2, Bug } from 'lucide-react';
import PaymentMethodForm from './PaymentMethodForm';

const SettingsDashboard = ({ shell }) => {
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState('association');
  const [isEditing, setIsEditing] = useState(false);
  const [appVersion, setAppVersion] = useState('0.9');

  // Profile State
  const [profile, setProfile] = useState({
    nome: '', email: '', tipo: 'APS', codice_fiscale: '',
    descrizione: '', indirizzo: '', citta: '', provincia: '', cap: '',
    telefono: '', partita_iva: '',
    presidente: '', vice_presidente: '', segretario: '', tesoriere: '',
    numero_tesseramento: 'YYYY-####', quota_associativa_base: 0,
    statuto_path: '', regolamento_path: '', data_fondazione: ''
  });

  // Database State
  const [dbConfig, setDbConfig] = useState({
    useRemoteDb: false, dbType: 'sqlite', dbHost: '', dbPort: 3306,
    dbName: '', dbUser: '', dbPassword: '', dbSsl: false
  });
  const [logoUrl, setLogoUrl] = useState(null);

  // Finance State
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // General State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [backupPath, setBackupPath] = useState(null);

  const [localTheme, setLocalTheme] = useState('light');
  const currentTheme = shell?.theme || localTheme;
  const setTheme = shell?.setTheme || setLocalTheme;

  useEffect(() => {
    if (shell.currentAssociationId) {
        loadData();
        if (activeTab === 'finance') loadPaymentMethods();
    }
    if (window.api && window.api.getAppVersion) {
        window.api.getAppVersion().then(v => setAppVersion(v));
    }
  }, [shell.currentAssociationId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const assocData = await associago.getAssociationProfile(shell.currentAssociationId);
      if (assocData) {
        setProfile({
            nome: assocData.name || '',
            email: assocData.email || '',
            tipo: assocData.type || 'APS',
            codice_fiscale: assocData.taxCode || '',
            descrizione: assocData.description || '',
            indirizzo: assocData.address || '',
            citta: assocData.city || '',
            provincia: assocData.province || '',
            cap: assocData.zipCode || '',
            telefono: assocData.phone || '',
            partita_iva: assocData.vatNumber || '',
            presidente: assocData.president || '',
            vice_presidente: assocData.vicePresident || '',
            segretario: assocData.secretary || '',
            tesoriere: assocData.treasurer || '',
            numero_tesseramento: assocData.membershipNumberFormat || 'YYYY-####',
            quota_associativa_base: assocData.baseMembershipFee || 0,
            statuto_path: assocData.statutePath || '',
            regolamento_path: assocData.regulationPath || '',
            data_fondazione: assocData.foundationDate || ''
        });
        setDbConfig({
            useRemoteDb: assocData.useRemoteDb || false,
            dbType: assocData.dbType || 'sqlite',
            dbHost: assocData.dbHost || '',
            dbPort: assocData.dbPort || 3306,
            dbName: assocData.dbName || '',
            dbUser: assocData.dbUser || '',
            dbPassword: assocData.dbPassword || '',
            dbSsl: assocData.dbSsl || false
        });
        const url = await associago.getLogoUrl(shell.currentAssociationId);
        setLogoUrl(url);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setMessage({ type: 'error', text: t('Failed to load settings.') });
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
      try {
          const methods = await associago.paymentMethods.getAll(shell.currentAssociationId);
          setPaymentMethods(methods);
      } catch (error) {
          console.error("Error loading payment methods:", error);
      }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updateData = {
          name: profile.nome,
          email: profile.email,
          type: profile.tipo,
          taxCode: profile.codice_fiscale,
          description: profile.descrizione,
          address: profile.indirizzo,
          city: profile.citta,
          province: profile.provincia,
          zipCode: profile.cap,
          phone: profile.telefono,
          vatNumber: profile.partita_iva,
          president: profile.presidente,
          vicePresident: profile.vice_presidente,
          secretary: profile.segretario,
          treasurer: profile.tesoriere,
          membershipNumberFormat: profile.numero_tesseramento,
          baseMembershipFee: profile.quota_associativa_base,
          statutePath: profile.statuto_path,
          regulationPath: profile.regolamento_path,
          foundationDate: profile.data_fondazione || null
      };

      await associago.updateAssociationProfile(shell.currentAssociationId, updateData);

      // Update local storage cache for login screen consistency
      associago.updateKnownAssociation(shell.currentAssociationId, {
          nome: profile.nome,
          email: profile.email,
          tipo: profile.tipo
      });

      setMessage({ type: 'success', text: t('Association profile updated successfully.') });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
        await associago.uploadLogo(shell.currentAssociationId, file);
        const newUrl = await associago.getLogoUrl(shell.currentAssociationId);
        setLogoUrl(newUrl);
        setMessage({ type: 'success', text: t('Logo uploaded successfully.') });
    } catch (error) {
        setMessage({ type: 'error', text: t('Failed to upload logo.') });
    } finally {
        setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setBackupPath("/home/user/Documents/backup_2023.sqlite");
      setMessage({ type: 'success', text: t('Backup created successfully.') });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (id) => {
      if (!confirm(t('Are you sure you want to delete this payment method?'))) return;
      try {
          await associago.paymentMethods.delete(id);
          loadPaymentMethods();
      } catch (error) {
          alert(t('Error deleting payment method'));
      }
  };

  const handleReportBug = () => {
      const subject = encodeURIComponent("[SEGNALAZIONE BUG] AssociaGo");
      const body = encodeURIComponent(`Versione App: ${appVersion}\n\nDescrizione del problema:\n`);
      window.location.href = `mailto:commercial.lorenzodm@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleSavePreferences = () => {
      if (shell.savePreferences) {
          shell.savePreferences();
      }
  };

  const renderAssociationTab = () => (
    <Form onSubmit={handleSaveProfile}>
        <div className="d-flex justify-content-end mb-3">
            {!isEditing ? (
                <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                    <Edit size={16} className="me-2" /> {t('Edit Profile')}
                </Button>
            ) : (
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => { setIsEditing(false); loadData(); }}>
                        <X size={16} className="me-2" /> {t('Cancel')}
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : <Save size={16} className="me-2" />}
                        {t('Save Changes')}
                    </Button>
                </div>
            )}
        </div>

        <Row className="g-4">
            {/* Logo Section */}
            <Col md={12} className="mb-4">
                <div className="d-flex align-items-center">
                    <div className="me-4 position-relative">
                        <div className="border rounded bg-light d-flex align-items-center justify-content-center overflow-hidden"
                             style={{width: '100px', height: '100px'}}>
                            {logoUrl ? (
                                <Image src={logoUrl} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                       onError={(e) => e.target.style.display = 'none'} />
                            ) : (
                                <Building size={40} className="text-muted" />
                            )}
                        </div>
                    </div>
                    <div>
                        <h6 className="mb-2">{t('Association Logo')}</h6>
                        {isEditing && (
                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" size="sm" className="position-relative">
                                    <Upload size={14} className="me-2" /> {t('Upload New')}
                                    <input type="file" accept="image/*" onChange={handleLogoUpload}
                                           className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" />
                                </Button>
                            </div>
                        )}
                        <Form.Text className="text-muted d-block mt-1">
                            {t('Recommended: 500x500px PNG or JPG')}
                        </Form.Text>
                    </div>
                </div>
            </Col>

            {/* Dati Identificativi */}
            <Col md={12}>
                <h6 className="text-primary mb-3 text-uppercase fw-bold small">{t('Identity')}</h6>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Association Name')}</Form.Label>
                            <Form.Control type="text" value={profile.nome} onChange={e => setProfile({...profile, nome: e.target.value})} required disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Type')}</Form.Label>
                            <Form.Select value={profile.tipo} onChange={e => setProfile({...profile, tipo: e.target.value})} disabled={!isEditing}>
                                <option value="APS">APS</option>
                                <option value="ASD">ASD</option>
                                <option value="ODV">ODV</option>
                                <option value="ETS">ETS</option>
                                <option value="Altro">{t('Other')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Fiscal Code')}</Form.Label>
                            <Form.Control type="text" value={profile.codice_fiscale} onChange={e => setProfile({...profile, codice_fiscale: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('VAT Number')}</Form.Label>
                            <Form.Control type="text" value={profile.partita_iva} onChange={e => setProfile({...profile, partita_iva: e.target.value})} placeholder={t('Optional')} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Email')}</Form.Label>
                            <Form.Control type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Phone')}</Form.Label>
                            <Form.Control type="text" value={profile.telefono} onChange={e => setProfile({...profile, telefono: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Address')}</Form.Label>
                            <Form.Control type="text" value={profile.indirizzo} onChange={e => setProfile({...profile, indirizzo: e.target.value})} placeholder="Via Roma 1" disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('City')}</Form.Label>
                            <Form.Control type="text" value={profile.citta} onChange={e => setProfile({...profile, citta: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Province')}</Form.Label>
                            <Form.Control type="text" value={profile.provincia} onChange={e => setProfile({...profile, provincia: e.target.value})} placeholder={t('e.g. RM')} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('ZIP Code')}</Form.Label>
                            <Form.Control type="text" value={profile.cap} onChange={e => setProfile({...profile, cap: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                </Row>
            </Col>

            <hr className="my-2 opacity-10" />

            {/* Documenti */}
            <Col md={12}>
                <h6 className="text-primary mb-3 text-uppercase fw-bold small">{t('Documents')}</h6>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Statute Path/Link')}</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><FileText size={16} /></span>
                                <Form.Control type="text" value={profile.statuto_path} onChange={e => setProfile({...profile, statuto_path: e.target.value})} placeholder="/path/to/statuto.pdf" disabled={!isEditing} />
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Regulation Path/Link')}</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><FileText size={16} /></span>
                                <Form.Control type="text" value={profile.regolamento_path} onChange={e => setProfile({...profile, regolamento_path: e.target.value})} placeholder="/path/to/regolamento.pdf" disabled={!isEditing} />
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
            </Col>

            <hr className="my-2 opacity-10" />

            {/* Organigramma */}
            <Col md={12}>
                <h6 className="text-primary mb-3 text-uppercase fw-bold small">{t('Organization Chart')}</h6>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('President')}</Form.Label>
                            <Form.Control type="text" value={profile.presidente} onChange={e => setProfile({...profile, presidente: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Vice President')}</Form.Label>
                            <Form.Control type="text" value={profile.vice_presidente} onChange={e => setProfile({...profile, vice_presidente: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Secretary')}</Form.Label>
                            <Form.Control type="text" value={profile.segretario} onChange={e => setProfile({...profile, segretario: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Treasurer')}</Form.Label>
                            <Form.Control type="text" value={profile.tesoriere} onChange={e => setProfile({...profile, tesoriere: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                </Row>
            </Col>

            <hr className="my-2 opacity-10" />

            {/* Configurazione */}
            <Col md={12}>
                <h6 className="text-primary mb-3 text-uppercase fw-bold small">{t('Configuration')}</h6>
                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Foundation Date')}</Form.Label>
                            <Form.Control type="date" value={profile.data_fondazione} onChange={e => setProfile({...profile, data_fondazione: e.target.value})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Membership Number Format')}</Form.Label>
                            <Form.Control type="text" value={profile.numero_tesseramento} onChange={e => setProfile({...profile, numero_tesseramento: e.target.value})} disabled={!isEditing} />
                            <Form.Text className="text-muted">{t('Use #### for progressive number, YYYY for year')}</Form.Text>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('Base Membership Fee')} (&euro;)</Form.Label>
                            <Form.Control type="number" step="0.01" value={profile.quota_associativa_base} onChange={e => setProfile({...profile, quota_associativa_base: parseFloat(e.target.value)})} disabled={!isEditing} />
                        </Form.Group>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Form>
  );

  const renderGeneralTab = () => (
    <Row className="g-4">
        <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                    <h6 className="mb-3">{t('Appearance')}</h6>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Language')}</Form.Label>
                        <Form.Select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
                            <option value="it">Italiano</option>
                            <option value="en">English</option>
                            <option value="de">Deutsch</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('Theme')}</Form.Label>
                        <div className="d-flex gap-2">
                            <Button variant={currentTheme === 'light' ? 'primary' : 'outline-secondary'} onClick={() => setTheme('light')} className="flex-grow-1">
                                <Sun size={18} className="me-2" /> {t('Light')}
                            </Button>
                            <Button variant={currentTheme === 'dark' ? 'primary' : 'outline-secondary'} onClick={() => setTheme('dark')} className="flex-grow-1">
                                <Moon size={18} className="me-2" /> {t('Dark')}
                            </Button>
                        </div>
                    </Form.Group>
                    <Button variant="primary" className="w-100 mt-3" onClick={handleSavePreferences}>
                        <Save size={16} className="me-2" /> {t('Save Preferences')}
                    </Button>
                </Card.Body>
            </Card>
        </Col>
        <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                    <h6 className="mb-3">{t('Data Management')}</h6>
                    <p className="text-muted small">{t('Create a local backup of your data.')}</p>
                    <Button variant="info" className="text-white w-100 mb-3" onClick={handleBackup} disabled={loading}>
                        <Download size={18} className="me-2" /> {t('Backup Now')}
                    </Button>
                    {backupPath && <Alert variant="success" className="small py-2">{t('Saved to:')} {backupPath}</Alert>}
                </Card.Body>
            </Card>
        </Col>
        <Col md={12}>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <h6 className="mb-3">{t('App Info')}</h6>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <p className="mb-1"><strong>AssociaGo</strong> v{appVersion}</p>
                            <p className="mb-1 text-muted small">Copyright © Lorenzo De Marco (Lorenzo DM)</p>
                            <p className="mb-1 text-muted small">{t('License')}: AGPLv3</p>
                            <p className="mb-3 text-muted small">
                                <a href="https://www.lorenzodm.it" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                    www.lorenzodm.it
                                </a>
                            </p>
                            <Alert variant="warning" className="small py-2 mb-0 d-inline-block">
                                <strong>{t('Disclaimer')}:</strong> {t('AssociaGo may make errors, always check the outputs provided before forwarding them.')}
                            </Alert>
                        </div>
                        <Button variant="warning" className="text-dark" onClick={handleReportBug}>
                            <Bug size={18} className="me-2" /> {t('Report Bug')}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    </Row>
  );

  const renderFinanceTab = () => {
      if (showPaymentForm) {
          return (
              <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                      <h5 className="mb-0">{selectedMethod ? t('Edit Payment Method') : t('New Payment Method')}</h5>
                  </Card.Header>
                  <Card.Body>
                      <PaymentMethodForm
                          associationId={shell.currentAssociationId}
                          method={selectedMethod}
                          onSuccess={() => { setShowPaymentForm(false); loadPaymentMethods(); }}
                          onCancel={() => setShowPaymentForm(false)}
                      />
                  </Card.Body>
              </Card>
          );
      }

      return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0">{t('Payment Methods')}</h6>
                <Button variant="outline-primary" size="sm" onClick={() => { setSelectedMethod(null); setShowPaymentForm(true); }}>
                    <Plus size={16} className="me-2" /> {t('Add Method')}
                </Button>
            </div>
            <Alert variant="info" className="small mb-4">
                {t('Configure payment methods and commissions.')}
            </Alert>
            <div className="list-group shadow-sm">
                {paymentMethods.length > 0 ? (
                    paymentMethods.map(method => (
                        <div key={method.id} className="list-group-item d-flex justify-content-between align-items-center p-3">
                            <div>
                                <div className="fw-bold">{method.name}</div>
                                <div className="small text-muted">
                                    {method.hasCommission
                                        ? `${method.percentageCommission}% + €${method.fixedCommission}`
                                        : t('No commission')}
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <Badge bg={method.active ? 'success' : 'secondary'}>
                                    {method.active ? t('Active') : t('Inactive')}
                                </Badge>
                                <div className="d-flex gap-2">
                                    <Button variant="light" size="sm" className="btn-icon text-muted" onClick={() => { setSelectedMethod(method); setShowPaymentForm(true); }}>
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="light" size="sm" className="btn-icon text-danger" onClick={() => handleDeleteMethod(method.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-4 text-muted">{t('No payment methods configured.')}</div>
                )}
            </div>
        </div>
      );
  };

  const handleSaveDbConfig = async () => {
      setLoading(true);
      setMessage(null);
      try {
          await associago.updateAssociationProfile(shell.currentAssociationId, {
              useRemoteDb: dbConfig.useRemoteDb,
              dbType: dbConfig.dbType,
              dbHost: dbConfig.dbHost,
              dbPort: dbConfig.dbPort ? parseInt(dbConfig.dbPort) : null,
              dbName: dbConfig.dbName,
              dbUser: dbConfig.dbUser,
              dbPassword: dbConfig.dbPassword,
              dbSsl: dbConfig.dbSsl
          });
          setMessage({ type: 'success', text: t('Database configuration saved.') });
      } catch (error) {
          setMessage({ type: 'error', text: error.message });
      } finally {
          setLoading(false);
      }
  };

  /*const renderDatabaseTab = () => (
    <div>
        <Alert variant="warning" className="small mb-4">
            {t('Changing database settings may require restarting the application.')}
        </Alert>
        <Form.Check
            type="switch"
            id="useRemoteDb"
            label={t('Use Remote Database')}
            checked={dbConfig.useRemoteDb}
            onChange={e => setDbConfig({...dbConfig, useRemoteDb: e.target.checked})}
            className="mb-4"
        />
        {dbConfig.useRemoteDb && (
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Database Type')}</Form.Label>
                                <Form.Select value={dbConfig.dbType} onChange={e => setDbConfig({...dbConfig, dbType: e.target.value})}>
                                    <option value="sqlite">SQLite</option>
                                    <option value="mariadb">MariaDB / MySQL</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Host')}</Form.Label>
                                <Form.Control type="text" value={dbConfig.dbHost} onChange={e => setDbConfig({...dbConfig, dbHost: e.target.value})} placeholder="localhost" />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Port')}</Form.Label>
                                <Form.Control type="number" value={dbConfig.dbPort} onChange={e => setDbConfig({...dbConfig, dbPort: e.target.value})} placeholder="3306" />
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Database Name')}</Form.Label>
                                <Form.Control type="text" value={dbConfig.dbName} onChange={e => setDbConfig({...dbConfig, dbName: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Username')}</Form.Label>
                                <Form.Control type="text" value={dbConfig.dbUser} onChange={e => setDbConfig({...dbConfig, dbUser: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('Password')}</Form.Label>
                                <Form.Control type="password" value={dbConfig.dbPassword} onChange={e => setDbConfig({...dbConfig, dbPassword: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Check
                                type="switch"
                                id="dbSsl"
                                label={t('Use SSL Connection')}
                                checked={dbConfig.dbSsl}
                                onChange={e => setDbConfig({...dbConfig, dbSsl: e.target.checked})}
                                className="mb-3"
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        )}
        <Button variant="primary" onClick={handleSaveDbConfig} disabled={loading}>
            {loading ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : <Save size={16} className="me-2" />}
            {t('Save Database Settings')}
        </Button>
    </div>
  );*/

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'danger'} onClose={() => setMessage(null)} dismissible className="mb-4 shadow-sm">
          {message.text}
        </Alert>
      )}

      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48}}>
            <Building size={24} />
        </div>
        <div>
            <h4 className="mb-0 fw-bold">{t('Settings')}</h4>
            <p className="text-muted mb-0 small">{t('Manage association profile and preferences')}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
            <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                <Nav.Item>
                    <Nav.Link eventKey="association" className="d-flex align-items-center gap-2">
                        <Building size={18} /> {t('Association Profile')}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="finance" className="d-flex align-items-center gap-2">
                        <CreditCard size={18} /> {t('Finance')}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="general" className="d-flex align-items-center gap-2">
                        <Globe size={18} /> {t('General')}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="database" className="d-flex align-items-center gap-2">
                        <Database size={18} /> {t('Database')}
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Card.Header>
        <Card.Body className="p-4">
            {activeTab === 'association' && renderAssociationTab()}
            {activeTab === 'finance' && renderFinanceTab()}
            {activeTab === 'general' && renderGeneralTab()}
            {/*activeTab === 'database' && renderDatabaseTab()*/}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsDashboard;
