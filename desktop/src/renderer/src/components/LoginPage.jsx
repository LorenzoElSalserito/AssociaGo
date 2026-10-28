import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { associago } from "../api.js";
import { Globe, Lock, Building, Mail, ArrowRight, Plus, Trash2, Hash, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import icon6 from '../assets/brand-mark.png';

// Per-language fiscal code / VAT rules used by the entity registration form.
// Country prefix (DE/FR/ES) is optional where the user might enter only the
// numeric/alphanumeric part. The UK has multiple valid identifier formats
// (Charity, CRN, UTR, VAT) so it uses a custom validator instead of a regex.
const UK_FISCAL_CODE_PATTERNS = [
    { name: "Charity Number",         regex: /^[0-9]{6,7}$/ },         // 6 or 7 digits
    { name: "Company Reg. Number",    regex: /^[0-9]{8}$/ },           // 8 digits
    { name: "Company Reg. Number",    regex: /^[A-Z]{2}[0-9]{6}$/ },   // 2 letters + 6 digits (e.g. CE123456)
    { name: "Unique Taxpayer Ref.",   regex: /^[0-9]{10}$/ },          // UTR: 10 digits
    { name: "VAT Number",             regex: /^GB[0-9]{9}$/ }          // VAT: GB + 9 digits
];

function normalizeFiscalCode(value) {
    return (value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function validateUkFiscalCode(value) {
    const v = normalizeFiscalCode(value);
    return UK_FISCAL_CODE_PATTERNS.some(p => p.regex.test(v));
}

const FISCAL_CODE_RULES = {
    it: { regex: /^[0-9]{11}$/,                  maxLength: 11, example: "12345678901" },
    de: { regex: /^(DE)?[0-9]{9}$/,              maxLength: 11, example: "DE123456789" },
    fr: { regex: /^(FR)?[A-Z0-9]{2}[0-9]{9}$/,   maxLength: 13, example: "FRXX123456789" },
    es: { regex: /^(ES)?[A-Z][0-9]{7}[A-Z0-9]$/, maxLength: 11, example: "ESA1234567B" },
    en: {
        validator: validateUkFiscalCode,
        maxLength: 11,
        // The UI hint lists every accepted UK identifier so the user knows
        // they can enter Charity Number, CRN, UTR or VAT Number.
        example: "GB123456789 / 12345678 / 1234567 / CE123456"
    }
};

function validateFiscalCodeForLanguage(value, language) {
    const rule = FISCAL_CODE_RULES[language] || FISCAL_CODE_RULES.it;
    if (typeof rule.validator === "function") {
        return rule.validator(value);
    }
    return rule.regex.test(normalizeFiscalCode(value));
}

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
    const [showPassword, setShowPassword] = useState(false);
    const [showSetupPassword, setShowSetupPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [failedAttempts, setFailedAttempts] = useState({});
    const [recoveryOpen, setRecoveryOpen] = useState(false);
    const [recoveryReason, setRecoveryReason] = useState("manual");
    const [recoveryStep, setRecoveryStep] = useState("ownership");
    const [recoveryAssociations, setRecoveryAssociations] = useState([]);
    const [recoverySelectedId, setRecoverySelectedId] = useState(null);
    const [recoveryFiscalCode, setRecoveryFiscalCode] = useState("");
    const [recoveryPassword, setRecoveryPassword] = useState("");
    const [recoveryPasswordConfirm, setRecoveryPasswordConfirm] = useState("");
    const [recoveryError, setRecoveryError] = useState(null);
    const [recoveryLoading, setRecoveryLoading] = useState(false);

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
            } else {
                associago.setPreferences({ autologin: null });
            }
            handleLoginSuccess(selectedAssoc, result.token);
        } catch (err) {
            const nextAttempts = (failedAttempts[selectedAssoc.id] || 0) + 1;
            setFailedAttempts({ ...failedAttempts, [selectedAssoc.id]: nextAttempts });
            setError(t("Invalid password"));
            setLoading(false);
            if (nextAttempts >= 2) {
                await openRecovery("too-many");
            }
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password || !formData.fiscalCode) {
            setError(t("All fields are required"));
            return;
        }

        if (!validateFiscalCodeForLanguage(formData.fiscalCode, i18n.language)) {
            const example = (FISCAL_CODE_RULES[i18n.language] || FISCAL_CODE_RULES.it).example;
            setError(t("Invalid fiscal code format. Expected: {{example}}", { example }));
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
            const result = await associago.login(newAssoc.id, formData.password);
            if (rememberMe) {
                associago.setPreferences({ autologin: { associationId: newAssoc.id, token: result.token } });
            } else {
                associago.setPreferences({ autologin: null });
            }
            handleLoginSuccess(newAssoc, result.token);
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

    const openRecovery = async (reason = "manual") => {
        setRecoveryReason(reason);
        setRecoveryStep("ownership");
        setRecoveryError(null);
        setRecoveryFiscalCode("");
        setRecoveryPassword("");
        setRecoveryPasswordConfirm("");
        setRecoverySelectedId(selectedAssoc?.id || null);
        setRecoveryOpen(true);
        setRecoveryLoading(true);
        try {
            const list = await associago.getRecoveryAssociations();
            setRecoveryAssociations(list || []);
            if (!selectedAssoc?.id && list?.length === 1) {
                setRecoverySelectedId(list[0].id);
            }
        } catch (err) {
            setRecoveryError(t("Unable to load recovery associations"));
        } finally {
            setRecoveryLoading(false);
        }
    };

    const closeRecovery = () => {
        setRecoveryOpen(false);
        setRecoveryError(null);
        setRecoveryLoading(false);
    };

    const confirmRecoveryOwnership = () => {
        if (!recoverySelectedId) {
            setRecoveryError(t("Select the association to recover"));
            return;
        }
        setRecoveryError(null);
        setRecoveryStep("reset");
    };

    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        if (!recoveryFiscalCode.trim()) {
            setRecoveryError(t("Fiscal code is required"));
            return;
        }
        if (recoveryPassword.length < 6) {
            setRecoveryError(t("Password must be at least 6 characters"));
            return;
        }
        if (recoveryPassword !== recoveryPasswordConfirm) {
            setRecoveryError(t("Passwords do not match"));
            return;
        }

        setRecoveryLoading(true);
        setRecoveryError(null);
        try {
            const association = await associago.resetPassword(recoverySelectedId, recoveryFiscalCode, recoveryPassword);
            const normalized = associago.upsertKnownAssociation(association);
            setAssociations(associago.getKnownAssociations());
            const result = await associago.login(normalized.id, recoveryPassword);
            associago.setPreferences({ autologin: null });
            handleLoginSuccess(normalized, result.token);
        } catch (err) {
            setRecoveryError(t("Recovery data does not match"));
            setRecoveryLoading(false);
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm(t("Remove this association from list?"))) {
            const newList = associago.removeKnownAssociation(id);
            setAssociations(newList);
            if (newList.length === 0) setView("create");
        }
    };

    if (view === "loading") return <div className="ag-login d-flex vh-100 justify-content-center align-items-center"><div className="spinner-border text-primary" role="status" aria-label={t("Loading...")}></div></div>;

    return (
        <div className="ag-login min-vh-100 d-flex align-items-center justify-content-center">
            <div className="card border-0 shadow-lg login-card">

                <div className="ag-login-header px-4 pt-4 pb-4 text-center text-white position-relative">
                    <div className="position-absolute top-0 end-0 p-3 d-flex align-items-center gap-2 lang-switch">
                        <Globe size={16} className="text-white opacity-75" />
                        <select
                            className="form-select form-select-sm fw-semibold text-primary shadow-sm border-0"
                            style={{ width: 'auto' }}
                            value={i18n.language}
                            onChange={(e) => { i18n.changeLanguage(e.target.value); associago.setPreferences({ language: e.target.value }); }}
                            aria-label={t("Language")}
                        >
                            <option value="it">IT</option>
                            <option value="en">EN</option>
                            <option value="es">ES</option>
                            <option value="de">DE</option>
                            <option value="fr">FR</option>
                        </select>
                    </div>
                    <div className="mb-2">
                        <img src={icon6} alt="AssociaGo" className="ag-login-brand" />
                    </div>
                    <h3 className="fw-bold mb-0">AssociaGo</h3>
                    <h4 className="opacity-75 mb-0">{t("Desktop Edition")}</h4>
                </div>

                <div className="card-body p-4 p-md-5">
                    {error && <div className="alert alert-danger py-2 small d-flex align-items-center"><i className="bi bi-exclamation-circle me-2"></i> {error}</div>}

                    {view === "list" && (
                        <div key="list" className="ag-view">
                            <h5 className="text-center mb-4 text-muted">{t("Select Association")}</h5>
                            <div className="d-grid gap-2 mb-4 ag-stagger">
                                {associations.map(assoc => (
                                    <div key={assoc.id} className="ag-choice" role="button" tabIndex={0}
                                         onClick={() => handleAssociationClick(assoc)}
                                         onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleAssociationClick(assoc); } }}>
                                        <div className="ag-choice-avatar">{assoc.nome ? assoc.nome.substring(0,2).toUpperCase() : "??"}</div>
                                        <div className="text-truncate flex-grow-1">
                                            <div className="fw-bold text-truncate">{assoc.nome}</div>
                                            <div className="small text-muted text-truncate">{assoc.tipo} • {assoc.email}</div>
                                        </div>
                                        <button type="button" className="btn btn-link text-danger p-1 ag-choice-delete" onClick={(e) => handleDelete(e, assoc.id)} aria-label={t("Remove association")}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-link w-100 text-decoration-none text-muted" onClick={() => setView("create")}>
                                <Plus size={18} className="me-1" /> {t("Add another association")}
                            </button>
                        </div>
                    )}

                    {view === "login-password" && (
                        <form key="login-password" onSubmit={handlePasswordSubmit} className="ag-view ag-stagger">
                            <div className="text-center mb-4">
                                <h5 className="fw-bold">{selectedAssoc?.nome}</h5>
                                <p className="text-muted small">{selectedAssoc?.email}</p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">{t("Password")}</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                                    <input type={showPassword ? "text" : "password"} className="form-control bg-light border-start-0" autoFocus
                                        value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" />
                                    <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowPassword((current) => !current)}>
                                        {showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                                    </button>
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
                                <button type="button" className="btn btn-outline-primary" onClick={() => openRecovery("manual")}>
                                    <ShieldCheck size={16} className="me-1" /> {t("Forgot password?")}
                                </button>
                                <button type="button" className="btn btn-light text-muted" onClick={() => setView("list")}>{t("Back")}</button>
                            </div>
                        </form>
                    )}

                    {view === "create" && (
                        <form key="create" onSubmit={handleCreateSubmit} className="ag-view ag-stagger">
                            <div className="text-center mb-4">
                                <h5 className="fw-bold">{t("Setup New Association")}</h5>
                                <p className="text-muted small">{t("Initialize your local database")}</p>
                            </div>

                            <div className="ag-wizard-section"><span className="ag-wizard-section-index">1</span>{t("Association details")}</div>

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
                                    <input type="text" className="form-control bg-light border-start-0" required
                                        placeholder={(FISCAL_CODE_RULES[i18n.language] || FISCAL_CODE_RULES.it).example}
                                        maxLength={(FISCAL_CODE_RULES[i18n.language] || FISCAL_CODE_RULES.it).maxLength}
                                        value={formData.fiscalCode} onChange={e => setFormData({...formData, fiscalCode: e.target.value.toUpperCase()})} />
                                </div>
                                <small className="text-muted">{t("Format")}: {(FISCAL_CODE_RULES[i18n.language] || FISCAL_CODE_RULES.it).example}</small>
                            </div>

                            <div className="ag-wizard-section mt-4"><span className="ag-wizard-section-index">2</span>{t("Administrator access")}</div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">{t("Admin Email")}</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted"/></span>
                                    <input type="email" className="form-control bg-light border-start-0" required
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">{t("Master Password")}</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                                    <input type={showSetupPassword ? "text" : "password"} className="form-control bg-light border-start-0" required minLength={6}
                                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowSetupPassword((current) => !current)}>
                                        {showSetupPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-check mb-4">
                                <input className="form-check-input" type="checkbox" id="setup-rem" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                <label className="form-check-label small text-muted" htmlFor="setup-rem">{t("Keep me logged in")}</label>
                            </div>

                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-primary py-2 fw-bold ag-btn-arrow" disabled={loading}>
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
            <style>{`
                .login-card .lang-switch select { min-width: 64px; }
                .login-card h3 { letter-spacing: .5px; }
                .recovery-modal-backdrop { background: rgba(15, 23, 42, .55); }
                .recovery-modal { width: min(560px, 94vw); max-height: 92vh; overflow: auto; }
                @media (max-width: 480px) {
                    .login-card { border-radius: 14px !important; }
                }
            `}</style>
            {recoveryOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center recovery-modal-backdrop p-3" style={{ zIndex: 1080 }}>
                    <div className="bg-white shadow-lg recovery-modal" style={{ borderRadius: 8 }}>
                        <div className="p-4 border-bottom">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: 8 }}>
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold">
                                        {recoveryReason === "too-many" ? t("Recover access securely") : t("Password recovery")}
                                    </h5>
                                    <div className="small text-muted">{t("Local database access recovery")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            {recoveryError && <div className="alert alert-danger py-2 small">{recoveryError}</div>}

                            {recoveryStep === "ownership" && (
                                <>
                                    <h6 className="fw-bold mb-3">{t("Are these associations yours?")}</h6>
                                    {recoveryLoading ? (
                                        <div className="text-center py-4"><span className="spinner-border spinner-border-sm" /></div>
                                    ) : (
                                        <div>
                                            <label className="form-label small fw-bold text-muted">{t("Select Association")}</label>
                                            <select
                                                className="form-select bg-light"
                                                value={recoverySelectedId || ""}
                                                onChange={(e) => setRecoverySelectedId(Number(e.target.value))}
                                            >
                                                <option value="" disabled>{t("Select the association to recover")}</option>
                                                {recoveryAssociations.map((assoc) => (
                                                    <option key={assoc.id} value={assoc.id}>
                                                        {assoc.name} - {assoc.type} - {assoc.email}
                                                    </option>
                                                ))}
                                            </select>
                                            {recoveryAssociations.length === 0 && (
                                                <div className="text-muted small mt-2">{t("No associations found in this database")}</div>
                                            )}
                                        </div>
                                    )}
                                    <div className="d-flex gap-2 justify-content-end mt-4">
                                        <button type="button" className="btn btn-light" onClick={closeRecovery}>{t("No")}</button>
                                        <button type="button" className="btn btn-primary" onClick={confirmRecoveryOwnership} disabled={recoveryLoading || recoveryAssociations.length === 0}>{t("Yes")}</button>
                                    </div>
                                </>
                            )}

                            {recoveryStep === "reset" && (
                                <form onSubmit={handleRecoverySubmit}>
                                    <h6 className="fw-bold mb-3">{t("Confirm the association fiscal code")}</h6>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">{t("Fiscal Code (C.F.)")}</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><Hash size={18} className="text-muted"/></span>
                                            <input
                                                type="text"
                                                className="form-control bg-light border-start-0"
                                                value={recoveryFiscalCode}
                                                onChange={e => setRecoveryFiscalCode(e.target.value.toUpperCase())}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">{t("New password")}</label>
                                        <input type="password" className="form-control bg-light" minLength={6} value={recoveryPassword} onChange={e => setRecoveryPassword(e.target.value)} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted">{t("Confirm new password")}</label>
                                        <input type="password" className="form-control bg-light" minLength={6} value={recoveryPasswordConfirm} onChange={e => setRecoveryPasswordConfirm(e.target.value)} />
                                    </div>
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button type="button" className="btn btn-light" onClick={() => setRecoveryStep("ownership")} disabled={recoveryLoading}>{t("Back")}</button>
                                        <button type="submit" className="btn btn-primary" disabled={recoveryLoading}>
                                            {recoveryLoading ? <span className="spinner-border spinner-border-sm" /> : t("Reset password")}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
