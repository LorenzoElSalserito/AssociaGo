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
import AppIcon from "../assets/brand-mark.png";

export default function LeftNav({ items, activeId, onSelect }) {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [appVersion, setAppVersion] = useState('');

    useEffect(() => {
        if (window.api?.getAppVersion) {
            window.api.getAppVersion().then(v => setAppVersion(v));
        }
    }, []);

    const groups = useMemo(() => [
        { label: 'navigation.overview', ids: ['dashboard'] },
        { label: 'navigation.people', ids: ['members', 'volunteers', 'attendance'] },
        { label: 'navigation.activities', ids: ['activities', 'events', 'inventory', 'coupons'] },
        { label: 'navigation.administration', ids: ['fiscal', 'budget', 'balance'] },
        { label: 'navigation.governance', ids: ['assemblies', 'certificates', 'communications'] },
        { label: 'navigation.support', ids: ['manual', 'settings'] }
    ].map(group => ({ ...group, items: group.ids.map(id => items.find(item => item.id === id)).filter(Boolean) })), [items]);

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
        <nav aria-label={t("navigation.main")} className={`jl-sidebar ${collapsed ? "collapsed" : ""}`}>
            {/* Logo Header */}
            <div className="jl-sidebar-header">
                <div className="jl-logo">
                    <img src={AppIcon} alt="AssociaGo" className="jl-logo-icon-img" />
                    {!collapsed && <span className="jl-logo-text">AssociaGo</span>}
                </div>
            </div>

            {/* Navigation Items - Flex Grow per occupare spazio */}
            <div className="jl-nav-container">
                {groups.map(group => <div className="jl-nav-group" key={group.label}>
                <h2 className="jl-nav-heading">{t(group.label)}</h2>
                <ul className="jl-nav-list">
                    {group.items.map((item) => (
                        <li key={item.id} className="jl-nav-item">
                            <button
                                data-nav-id={item.id}
                                aria-label={item.label}
                                aria-current={activeId === item.id ? "page" : undefined}
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
                </div>)}
            </div>

            {/* Footer / Collapse Toggle */}
            <div className="jl-sidebar-footer">
                <button
                    className="jl-collapse-btn"
                    aria-expanded={!collapsed}
                    aria-label={t(collapsed ? "navigation.expand" : "navigation.collapse")}
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? t("More") : t("Less")}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                {!collapsed && (
                    <div className="jl-sidebar-branding">
                        <small >AssociaGo {appVersion ? `v${appVersion}` : ''}</small>
                    </div>
                )}
            </div>

        </nav>
    );
}
