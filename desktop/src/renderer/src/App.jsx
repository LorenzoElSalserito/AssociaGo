import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { associago } from './api';
import { Search, Sun, Moon } from 'lucide-react';

// Layout Components
import LeftNav from "./components/LeftNav";
import TopHeader from "./components/TopHeader";
import ProfileMenu from "./components/ProfileMenu";
import CommandPalette from "./components/CommandPalette";
import NotificationBell from "./components/NotificationBell";
import LoginPage from './components/LoginPage';
import SplashScreen from './components/SplashScreen';
import Modal from './components/Modal';
import ErrorBoundary from './components/ErrorBoundary';

// Page Components
import MemberList from './components/MemberList';
import Dashboard from './components/Dashboard';
import ActivityList from './components/ActivityList';
import EventList from './components/EventList';
import FiscalDashboard from './components/FiscalDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import AssemblyList from './components/AssemblyList';
import InventoryList from './components/InventoryList';
import VolunteerList from './components/VolunteerList';
import AttendanceList from './components/AttendanceList';
import CouponList from './components/CouponList';
import ManualDashboard from './components/ManualDashboard';
import BudgetDashboard from './components/BudgetDashboard';
import AnnualBalanceDashboard from './components/AnnualBalanceDashboard';
import CertificateList from './components/CertificateList';
import CommunicationDashboard from './components/CommunicationDashboard';
//import ResourceBookingDashboard from './components/ResourceBookingDashboard';
//import CashRegisterDashboard from './components/CashRegisterDashboard';
//import CsvImportDashboard from './components/CsvImportDashboard';

// Form Components
import MemberForm from './components/MemberForm';
import ActivityForm from './components/ActivityForm';
import ActivityCostForm from './components/ActivityCostForm';
import ActivityInstructorForm from './components/ActivityInstructorForm';
import ActivityScheduleForm from './components/ActivityScheduleForm';
import ActivityParticipantForm from './components/ActivityParticipantForm';
import EventForm from './components/EventForm';
import EventParticipantForm from './components/EventParticipantForm';
import AssemblyForm from './components/AssemblyForm';
import AssemblyMotionForm from './components/AssemblyMotionForm';
import AssemblyDocumentForm from './components/AssemblyDocumentForm';
import AssemblyParticipantForm from './components/AssemblyParticipantForm';
import InventoryForm from './components/InventoryForm';
import InventoryLoanForm from './components/InventoryLoanForm';
import VolunteerForm from './components/VolunteerForm';
import VolunteerShiftForm from './components/VolunteerShiftForm';
import VolunteerExpenseForm from './components/VolunteerExpenseForm';
import CouponForm from './components/CouponForm';

function App() {
  const { t, i18n } = useTranslation();

  const [appState, setAppState] = useState('LOADING');
  const [connected, setConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [startupError, setStartupError] = useState(false);
  useEffect(() => {
    const update = event => setConnected(event.detail.connected);
    window.addEventListener('associago:connection', update);
    return () => window.removeEventListener('associago:connection', update);
  }, []);
  const [activeId, setActiveId] = useState('dashboard');
  // Optional item to open once the destination page mounts, e.g. { page: 'events', eventId }.
  const [navTarget, setNavTarget] = useState(null);

  const [currentAssociation, setCurrentAssociation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [zoom, setZoom] = useState(() => {
    const saved = Number(localStorage.getItem('associago_zoom'));
    return [50,75,100,125,150,175,200].includes(saved) ? saved : 100;
  });
  useEffect(() => {
    localStorage.setItem('associago_zoom', String(zoom));
    if (window.api?.setZoom) window.api.setZoom(zoom).catch(console.error);
    else document.documentElement.style.zoom = String(zoom / 100);
  }, [zoom]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalProps, setModalProps] = useState({});

  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    initApp();
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setCommandPaletteOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Load preferences
    const prefs = associago.getPreferences();
    if (prefs.language) i18n.changeLanguage(prefs.language);
    if (prefs.theme) setTheme(prefs.theme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const initApp = async () => {
    try {
      const { baseUrl } = await associago.init();
      console.log('API Ready:', baseUrl);
      setStartupError(false);
      setAppState('LOGIN');
    } catch (err) {
      console.error("Init failed:", err);
      setStartupError(true);
    }
  };

  const handleLogin = (association) => {
    associago.setCurrentAssociation(association.id);
    setCurrentAssociation(association);

    setCurrentUser({
        id: association.id,
        displayName: association.nome, // Updated from .name
        username: association.email,
        role: 'ADMIN'
    });

    setAppState('DASHBOARD');
  };

  const handleLogout = () => {
    setAppState('LOADING');
    associago.setCurrentAssociation(null);
    associago.setAuthToken(null);
    // Logging out must also end "Keep me logged in", or the login page would sign straight back in.
    associago.setPreferences({ autologin: null });
    setTimeout(() => {
        setCurrentAssociation(null);
        setCurrentUser(null);
        setAppState('LOGIN');
    }, 500);
  };

  const savePreferences = () => {
      associago.setPreferences({
          language: i18n.language,
          theme: theme
      });
      setToast({ type: 'success', message: t('Preferences saved successfully.') });
      setTimeout(() => setToast(null), 3000);
  };

  const openModal = (type, props = {}) => {
      setModalType(type);
      setModalProps(props);
      setModalOpen(true);
  };

  const closeModal = () => {
      setModalOpen(false);
      setModalType(null);
      setModalProps({});
  };

  const renderModalContent = () => {
      const commonProps = { ...modalProps, onCancel: closeModal, onSuccess: () => { modalProps.onSuccess?.(); closeModal(); } };
      switch (modalType) {
          case 'member-form': return <MemberForm {...commonProps} />;
          case 'activity-form': return <ActivityForm {...commonProps} />;
          case 'activity-cost-form': return <ActivityCostForm {...commonProps} />;
          case 'activity-instructor-form': return <ActivityInstructorForm {...commonProps} />;
          case 'activity-schedule-form': return <ActivityScheduleForm {...commonProps} />;
          case 'activity-participant-form': return <ActivityParticipantForm {...commonProps} />;
          case 'event-form': return <EventForm {...commonProps} />;
          case 'event-participant-form': return <EventParticipantForm {...commonProps} />;
          case 'assembly-form': return <AssemblyForm {...commonProps} />;
          case 'assembly-motion-form': return <AssemblyMotionForm {...commonProps} />;
          case 'assembly-document-form': return <AssemblyDocumentForm {...commonProps} />;
          case 'assembly-participant-form': return <AssemblyParticipantForm {...commonProps} />;
          case 'inventory-form': return <InventoryForm {...commonProps} />;
          case 'inventory-loan-form': return <InventoryLoanForm {...commonProps} />;
          case 'volunteer-form': return <VolunteerForm {...commonProps} />;
          case 'volunteer-shift-form': return <VolunteerShiftForm {...commonProps} />;
          case 'volunteer-expense-form': return <VolunteerExpenseForm {...commonProps} />;
          case 'coupon-form': return <CouponForm {...commonProps} />;
          default: return null;
      }
  };

  const PAGES = useMemo(() => [
    { id: "dashboard", label: t('nav.dashboard'), icon: "bi-speedometer2", component: Dashboard },
    { id: "members", label: t('nav.members'), icon: "bi-people", component: MemberList },
    { id: "activities", label: t('nav.activities'), icon: "bi-calendar3", component: ActivityList },
    { id: "events", label: t('nav.events'), icon: "bi-calendar3", component: EventList },
    { id: "fiscal", label: t('nav.fiscal'), icon: "bi-credit-card", component: FiscalDashboard },
    { id: "assemblies", label: t('nav.assemblies'), icon: "bi-file-text", component: AssemblyList },
    { id: "inventory", label: t('nav.inventory'), icon: "bi-box-seam", component: InventoryList },
    { id: "volunteers", label: t('nav.volunteers'), icon: "bi-person-check", component: VolunteerList },
    { id: "attendance", label: t('nav.attendance'), icon: "bi-check2-square", component: AttendanceList },
    { id: "coupons", label: t('nav.coupons'), icon: "bi-ticket-perforated", component: CouponList },
    { id: "budget", label: t('nav.budget'), icon: "bi-piggy-bank", component: BudgetDashboard },
    { id: "balance", label: t('nav.balance'), icon: "bi-bar-chart", component: AnnualBalanceDashboard },
    { id: "certificates", label: t('nav.certificates'), icon: "bi-award", component: CertificateList },
    { id: "communications", label: t('nav.communications'), icon: "bi-envelope", component: CommunicationDashboard },
    //{ id: "resources", label: t('nav.resources'), icon: "bi-door-open", component: ResourceBookingDashboard },
    //{ id: "cash-register", label: t('nav.cashRegister'), icon: "bi-banknote", component: CashRegisterDashboard },
    //{ id: "csv-import", label: t('nav.csvImport'), icon: "bi-upload", component: CsvImportDashboard },
    { id: "manual", label: t('User Manual'), icon: "bi-book", component: ManualDashboard },
    { id: "settings", label: t('nav.settings'), icon: "bi-gear", component: SettingsDashboard },
  ], [t]);

  const activePage = PAGES.find(p => p.id === activeId) || PAGES[0];

  const shell = useMemo(() => ({
    navigate: (id, target = null) => { setNavTarget(target ? { page: id, ...target } : null); setActiveId(id); },
    navTarget,
    clearNavTarget: () => setNavTarget(null),
    pages: PAGES.map(({ id, label }) => ({ id, label })),
    openModal,
    closeModal,
    currentUser,
    currentAssociation,
    currentAssociationId: currentAssociation?.id, // Fix for SettingsDashboard
    theme,
    setTheme,
    zoom,
    setZoom,
    savePreferences // Expose savePreferences to shell
  }), [currentUser, currentAssociation, theme, zoom, i18n.language, PAGES, navTarget]);

  const profileItems = [
    { id: "settings", label: t('nav.settings'), icon: "bi-gear", onClick: () => setActiveId("settings") },
    { id: "info", label: t('App Info'), icon: "bi-info-circle" },
    { type: "sep" },
    { id: "logout", label: t('Logout'), icon: "bi-box-arrow-right", danger: true, onClick: handleLogout }
  ];

  if (appState === 'LOADING') return <SplashScreen message={t(startupError ? 'connection.unavailable' : 'app.loading')} onRetry={startupError ? initApp : undefined} />;
  if (appState === 'LOGIN') return <LoginPage onLogin={handleLogin} />;

  const PageComponent = activePage.component;

  return (
    <div className="jl-root">
      <a className="ag-skip-link" href="#main-content">{t("navigation.skip")}</a>
      <div className="jl-appframe">
        <div className="jl-shell">
            <CommandPalette shell={shell} isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
            <LeftNav items={PAGES} activeId={activeId} onSelect={setActiveId} />
            <main className="jl-main">
                <TopHeader
                    title={activePage.label}
                    context={currentAssociation?.nome}
                    actions={
                        <>
                            <button type="button" className="btn btn-light ag-search-trigger" onClick={() => setCommandPaletteOpen(true)} aria-label={t('navigation.search')}>
                                <Search size={18} /><span>{t('navigation.search')}</span><kbd>Ctrl / ⌘ K</kbd>
                            </button>
                            <button type="button" className="btn btn-light" aria-label={t(theme === 'dark' ? 'Light' : 'Dark')} onClick={() => {
                                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                                setTheme(nextTheme);
                                associago.setPreferences({ theme: nextTheme });
                            }}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
                            <NotificationBell associationId={currentAssociation?.id} shell={shell} />
                            <ProfileMenu
                                initials={currentAssociation?.nome?.substring(0, 2)?.toUpperCase() || "AG"}
                                title={currentAssociation?.nome}
                                subtitle={currentUser?.username}
                                items={profileItems}
                            />
                        </>
                    }
                />
                {!connected && <div className="alert alert-warning m-3 mb-0" role="alert">
                    <span>{t('connection.unavailable')}</span>
                    <button type="button" className="btn btn-outline-primary ms-3" disabled={connecting} onClick={async () => {
                        setConnecting(true);
                        try { await associago.reconnect(); setConnected(true); }
                        catch { setConnected(false); }
                        finally { setConnecting(false); }
                    }}>{t('Retry')}</button>
                </div>}
                <section className="jl-content" id="main-content" tabIndex={-1} data-page={activeId}>
                    <div className="jl-page p-4">
                        <ErrorBoundary>
                            <PageComponent shell={shell} associationId={currentAssociation?.id} />
                        </ErrorBoundary>
                    </div>
                </section>
            </main>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={closeModal} title={t('Edit Item')}>
          {renderModalContent()}
      </Modal>

      {/* Global Toast Notification */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
            <div className={`toast show align-items-center text-white bg-${toast.type === 'error' ? 'danger' : 'success'} border-0`} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex">
                    <div className="toast-body">
                        {toast.message}
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} aria-label={t('Close')}></button>
                </div>
            </div>
        </div>
      )}


    </div>
  );
}

export default App;
