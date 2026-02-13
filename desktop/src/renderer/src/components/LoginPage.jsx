import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { associago } from "../api.js";
import { Globe, Lock, Building, Mail, ArrowRight, Plus, Trash2, FileText, Hash } from 'lucide-react';
import icon6 from '../assets/6.svg';

export default function LoginPage({ onLogin }) {
    const { t, i18n } = useTranslation();

    const [view, setView] = useState("loading");
    const [associations, setAssociations] = useState([]);
    const [selectedAssoc, setSelectedAssoc] = useState(null);

    // Form Data Esteso
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        email: "",
        password: "",
        type: "APS", // Default
        fiscalCode: ""
    });

    const [passwordInput, setPasswordInput] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { bootstrap(); }, []);

    const bootstrap = async () => {
        let list = associago.getKnownAssociations();
        const prefs = associago.getPreferences();

        // Validate cached associations against the backend
        let backendReachable = true;
        if (list.length > 0) {
            try {
                const validationResults = await Promise.all(
                    list.map(async (assoc) => {
                        try {
                            const valid = await associago.validateAssociation(assoc.id);
                            return { assoc, valid };
                        } catch (e) {
                            // If the error is not a 404, the backend may be unreachable
                            backendReachable = false;
                            return { assoc, valid: true }; // Keep in offline mode
                        }
                    })
                );

                if (backendReachable) {
                    const invalidIds = validationResults
                        .filter(r => !r.valid)
                        .map(r => r.assoc.id);
                    for (const id of invalidIds) {
                        associago.removeKnownAssociation(id);
                    }
                    list = associago.getKnownAssociations();
                }
            } catch (e) {
                // Backend entirely unreachable, keep cache as-is
            }
        }

        setAssociations(list);

        // Validate autologin association before auto-logging in
        if (prefs.autologin && list.some(a => a.id === prefs.autologin.associationId)) {
            if (backendReachable) {
                try {
                    const autologinValid = await associago.validateAssociation(prefs.autologin.associationId);
                    if (autologinValid) {
                        const target = list.find(a => a.id === prefs.autologin.associationId);
                        handleLoginSuccess(target, prefs.autologin.token);
                        return;
                    }
                    // Autologin association was deleted, clear autologin pref
                    associago.removeKnownAssociation(prefs.autologin.associationId);
                    list = associago.getKnownAssociations();
                    setAssociations(list);
                } catch (e) {
                    // Backend unreachable, proceed with autologin using cache
                    const target = list.find(a => a.id === prefs.autologin.associationId);
                    handleLoginSuccess(target, prefs.autologin.token);
                    return;
                }
            } else {
                const target = list.find(a => a.id === prefs.autologin.associationId);
                handleLoginSuccess(target, prefs.autologin.token);
                return;
            }
        }

        setView(list.length === 0 ? "create" : "list");
    };

    const handleAssociationClick = (assoc) => {
        setSelectedAssoc(assoc);
        setView("login-password");
        setError(null);
        setPasswordInput("");
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await associago.login(selectedAssoc.id, passwordInput);
            if (rememberMe) {
                associago.setPreferences({ autologin: { associationId: selectedAssoc.id, token: result.token } });
            }
            handleLoginSuccess(selectedAssoc, result.token);
        } catch (err) {
            setError(t("Invalid password"));
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password || !formData.fiscalCode) {
            setError(t("All fields are required"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                type: formData.type,
                taxCode: formData.fiscalCode,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
            };

            const newAssoc = await associago.setupAssociation(payload);
            handleLoginSuccess(newAssoc, "new-session-token");
        } catch (err) {
            setError(err.message || t("Setup failed"));
            setLoading(false);
        }
    };

    const handleLoginSuccess = (assoc, token) => {
        associago.setAuthToken(token);
        associago.setCurrentAssociation(assoc.id); // Set current association ID
        onLogin(assoc);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm(t("Remove this association from list?"))) {
            const newList = associago.removeKnownAssociation(id);
            setAssociations(newList);
            if (newList.length === 0) setView("create");
        }
    };

    if (view === "loading") return <div className="d-flex vh-100 justify-content-center align-items-center bg-light"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div className="card border-0 shadow-lg" style={{ width: '480px', borderRadius: '20px', overflow: 'hidden' }}>

                <div className="bg-primary p-4 text-center text-white position-relative">
                    <div className="position-absolute top-0 end-0 p-3">
                         <select className="form-select form-select-sm bg-white bg-opacity-25 border-0 text-white" style={{ width: 'auto' }}
                            value={i18n.language} onChange={(e) => { i18n.changeLanguage(e.target.value); associago.setPreferences({ language: e.target.value }); }}>
                            <option value="it" className="text-dark">IT</option>
                            <option value="en" className="text-dark">EN</option>
                            <option value="es" className="text-dark">ES</option>
                            <option value="de" className="text-dark">DE</option>
                            <option value="fr" className="text-dark">FR</option>
                        </select>
                    </div>
                    <div className="mb-2">
                        <img src={icon6} alt="Icon" style={{ width: 125, height: 125 }} />
                    </div>
                    <h3 className="fw-bold mb-0">AssociaGo</h3>
                    <h4 className="opacity-75">{t("Desktop Edition")}</h4>
                </div>

                <div className="card-body p-4">
                    {error && <div className="alert alert-danger py-2 small d-flex align-items-center"><i className="bi bi-exclamation-circle me-2"></i> {error}</div>}

                    {view === "list" && (
                        <>
                            <h5 className="text-center mb-4 text-muted">{t("Select Association")}</h5>
                            <div className="d-grid gap-2 mb-4">
                                {associations.map(assoc => (
                                    <div key={assoc.id} className="btn btn-outline-light text-dark border d-flex align-items-center justify-content-between p-3 text-start shadow-sm hover-shadow"
                                         onClick={() => handleAssociationClick(assoc)} style={{ transition: 'all 0.2s' }}>
                                        <div className="d-flex align-items-center overflow-hidden">
                                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{width: 40, height: 40}}>
                                                <span className="fw-bold">{assoc.nome ? assoc.nome.substring(0,2).toUpperCase() : "??"}</span>
                                            </div>
                                            <div className="text-truncate">
                                                <div className="fw-bold text-truncate">{assoc.nome}</div>
                                                <div className="small text-muted text-truncate">{assoc.tipo} • {assoc.email}</div>
                                            </div>
                                        </div>
                                        <button className="btn btn-link text-danger p-0 ms-2 opacity-50 hover-opacity-100" onClick={(e) => handleDelete(e, assoc.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-link w-100 text-decoration-none text-muted" onClick={() => setView("create")}>
                                <Plus size={18} className="me-1" /> {t("Add another association")}
                            </button>
                        </>
                    )}

                    {view === "login-password" && (
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="text-center mb-4">
                                <h5 className="fw-bold">{selectedAssoc?.nome}</h5>
                                <p className="text-muted small">{selectedAssoc?.email}</p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">{t("Password")}</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                                    <input type="password" className="form-control bg-light border-start-0" autoFocus
                                        value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="form-check mb-4">
                                <input className="form-check-input" type="checkbox" id="rem" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                <label className="form-check-label small text-muted" htmlFor="rem">{t("Keep me logged in")}</label>
                            </div>
                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-primary py-2 fw-bold" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm"/> : t("Login")}
                                </button>
                                <button type="button" className="btn btn-light text-muted" onClick={() => setView("list")}>{t("Back")}</button>
                            </div>
                        </form>
                    )}

                    {view === "create" && (
                        <form onSubmit={handleCreateSubmit}>
                            <div className="text-center mb-4">
                                <h5 className="fw-bold">{t("Setup New Association")}</h5>
                                <p className="text-muted small">{t("Initialize your local database")}</p>
                            </div>

                            <div className="row g-2 mb-3">
                                <div className="col-8">
                                    <label className="form-label small fw-bold text-muted">{t("Association Name")}</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><Building size={18} className="text-muted"/></span>
                                        <input type="text" className="form-control bg-light border-start-0" required
                                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                </div>
                                <div className="col-4">
                                    <label className="form-label small fw-bold text-muted">{t("Type")}</label>
                                    <select className="form-select bg-light" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="APS">APS</option>
                                        <option value="ASD">ASD</option>
                                        <option value="ODV">ODV</option>
                                        <option value="ETS">ETS</option>
                                        <option value="Altro">{t("Other")}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">{t("Fiscal Code (C.F.)")}</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><Hash size={18} className="text-muted"/></span>
                                    <input type="text" className="form-control bg-light border-start-0" required placeholder="970..."
                                        value={formData.fiscalCode} onChange={e => setFormData({...formData, fiscalCode: e.target.value.toUpperCase()})} />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">{t("Admin Email")}</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted"/></span>
                                    <input type="email" className="form-control bg-light border-start-0" required
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">{t("Master Password")}</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                                    <input type="password" className="form-control bg-light border-start-0" required minLength={6}
                                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                </div>
                            </div>

                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-primary py-2 fw-bold" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm"/> : <>{t("Initialize Database")} <ArrowRight size={16} className="ms-1"/></>}
                                </button>
                                {associations.length > 0 && (
                                    <button type="button" className="btn btn-light text-muted" onClick={() => setView("list")}>{t("Cancel")}</button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <style>{`.hover-shadow:hover { background-color: #f8f9fa !important; border-color: #0d6efd !important; transform: translateY(-1px); } .hover-opacity-100:hover { opacity: 1 !important; }`}</style>
        </div>
    );
}
