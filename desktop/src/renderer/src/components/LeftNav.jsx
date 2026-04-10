import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    ClipboardList,
    Package,
    UserCheck,
    FileText,
    PiggyBank,
    Award,
    Upload,
    Mail,
    DoorOpen,
    Banknote,
    BarChart3,
    CheckSquare,
    BookOpen as BookOpenIcon
} from "lucide-react";
import AppIcon from "../assets/6.svg";

export default function LeftNav({ items, activeId, onSelect }) {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [appVersion, setAppVersion] = useState('');

    useEffect(() => {
        if (window.api?.getAppVersion) {
            window.api.getAppVersion().then(v => setAppVersion(v));
        }
    }, []);

    const visibleItems = useMemo(() => items, [items]);

    const renderIcon = (iconName) => {
        switch (iconName) {
            case "bi-speedometer2": return <LayoutDashboard size={20} />;
            case "bi-people": return <Users size={20} />;
            case "bi-calendar3": return <Calendar size={20} />;
            case "bi-credit-card": return <CreditCard size={20} />;
            case "bi-gear": return <Settings size={20} />;
            case "bi-card-checklist": return <ClipboardList size={20} />;
            case "bi-journal-text": return <BookOpen size={20} />;
            case "bi-box-seam": return <Package size={20} />;
            case "bi-person-check": return <UserCheck size={20} />;
            case "bi-file-text": return <FileText size={20} />;
            case "bi-piggy-bank": return <PiggyBank size={20} />;
            case "bi-award": return <Award size={20} />;
            case "bi-upload": return <Upload size={20} />;
            case "bi-mail": return <Mail size={20} />;
            case "bi-door-open": return <DoorOpen size={20} />;
            case "bi-banknote": return <Banknote size={20} />;
            case "bi-bar-chart": return <BarChart3 size={20} />;
            case "bi-check2-square": return <CheckSquare size={20} />;
            case "bi-ticket-perforated": return <CreditCard size={20} />;
            case "bi-envelope": return <Mail size={20} />;
            case "bi-book": return <BookOpenIcon size={20} />;
            default: return <LayoutDashboard size={20} />;
        }
    };

    return (
        <nav className={`jl-sidebar ${collapsed ? "collapsed" : ""}`}>
            {/* Logo Header */}
            <div className="jl-sidebar-header">
                <div className="jl-logo">
                    <img src={AppIcon} alt="AssociaGo" className="jl-logo-icon-img" />
                    {!collapsed && <span className="jl-logo-text">AssociaGo</span>}
                </div>
            </div>

            {/* Navigation Items - Flex Grow per occupare spazio */}
            <div className="jl-nav-container">
                <ul className="jl-nav-list">
                    {visibleItems.map((item) => (
                        <li key={item.id} className="jl-nav-item">
                            <button
                                className={`jl-nav-link ${activeId === item.id ? "active" : ""}`}
                                onClick={() => onSelect(item.id)}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="jl-nav-icon-wrapper">
                                    {renderIcon(item.icon)}
                                </span>
                                {!collapsed && <span className="jl-nav-label">{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer / Collapse Toggle */}
            <div className="jl-sidebar-footer">
                <button
                    className="jl-collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? t("More") : t("Less")}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                {!collapsed && (
                    <div className="jl-sidebar-branding">
                        <small className="text-muted opacity-75">AssociaGo {appVersion ? `v${appVersion}` : ''}</small>
                    </div>
                )}
            </div>

            <style>{`
                .jl-sidebar {
                    display: flex;
                    flex-direction: column;
                    width: 260px;
                    min-width: 260px;
                    background: var(--bs-body-bg); /* Usa variabile Bootstrap */
                    border-right: 1px solid var(--bs-border-color);
                    color: var(--bs-body-color);
                    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .jl-sidebar.collapsed {
                    width: 80px;
                    min-width: 80px;
                }

                .jl-sidebar-header {
                    padding: 1.5rem 1.25rem;
                    height: 80px;
                    display: flex;
                    align-items: center;
                }

                .jl-logo {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }

                .jl-logo-icon-img {
                    width: 50px;
                    height: 50px;
                    object-fit: contain;
                    flex-shrink: 0;
                }

                .jl-logo-text {
                    font-weight: 800;
                    font-size: 1.75rem;
                    letter-spacing: -0.5px;
                    background: linear-gradient(45deg, #0d6efd, #6610f2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    white-space: nowrap;
                    overflow: hidden;
                }

                /* Container che occupa lo spazio rimanente */
                .jl-nav-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                }

                .jl-nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    width: 100%;
                }

                .jl-nav-item {
                    margin-bottom: 0.5rem;
                }

                .jl-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                    padding: 0.85rem 1rem;
                    border: none;
                    border-radius: 12px;
                    background: transparent;
                    color: var(--bs-secondary-color);
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    white-space: nowrap;
                    overflow: hidden;
                }

                .jl-nav-link:hover {
                    background: var(--bs-tertiary-bg);
                    color: var(--bs-primary);
                    transform: translateX(4px);
                }

                .jl-nav-link.active {
                    background: linear-gradient(90deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%);
                    color: var(--bs-primary);
                    font-weight: 600;
                    box-shadow: inset 3px 0 0 var(--bs-primary);
                }

                .jl-nav-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }

                .jl-sidebar-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--bs-border-color);
                }

                .jl-collapse-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--bs-border-color);
                    border-radius: 10px;
                    background: var(--bs-tertiary-bg);
                    color: var(--bs-secondary-color);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .jl-collapse-btn:hover {
                    background: var(--bs-secondary-bg);
                    color: var(--bs-primary);
                    border-color: var(--bs-primary);
                }

                .jl-sidebar-branding {
                    text-align: center;
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    overflow: hidden;
                }

                .jl-sidebar.collapsed .jl-nav-link {
                    justify-content: center;
                    padding: 0.85rem;
                }

                .jl-sidebar.collapsed .jl-sidebar-header {
                    justify-content: center;
                    padding: 1.5rem 0;
                }

                .jl-sidebar.collapsed .jl-logo {
                    justify-content: center;
                }
            `}</style>
        </nav>
    );
}
