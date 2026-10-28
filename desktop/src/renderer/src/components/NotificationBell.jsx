import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, CalendarDays, Contact, Info } from 'lucide-react';
import { Overlay, Popover, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

const POLL_MS = 30000;
const DESTINATIONS = {
    EVENT: (id) => ['events', { eventId: id }],
    MEMBERSHIP: (id) => ['members', { membershipId: id }],
    ACTIVITY: () => ['activities'],
    ASSEMBLY: () => ['assemblies'],
    INVENTORY: () => ['inventory'],
    VOLUNTEER: () => ['volunteers'],
};
const ICONS = { EVENT: CalendarDays, MEMBERSHIP: Contact };

function parseParams(raw) {
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch { return {}; }
}

export default function NotificationBell({ associationId, shell }) {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [show, setShow] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const buttonRef = useRef(null);
    const listRef = useRef(null);
    const focusedRef = useRef(false);

    const fetchCount = useCallback(async () => {
        try {
            const data = await associago.notifications.unreadCount();
            setUnreadCount(data?.count ?? 0);
        } catch (error) {
            console.error('Failed to fetch notification count', error);
        }
    }, []);

    const fetchList = useCallback(async () => {
        try {
            const data = await associago.notifications.list(50);
            setNotifications(Array.isArray(data) ? data : []);
            setLoadError(false);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            setLoadError(true);
        }
    }, []);

    useEffect(() => {
        setNotifications([]);
        setUnreadCount(0);
        if (!associationId) return undefined;
        fetchCount();
        const interval = setInterval(fetchCount, POLL_MS);
        return () => clearInterval(interval);
    }, [associationId, fetchCount]);

    useEffect(() => {
        if (show) fetchList();
    }, [show, unreadCount, fetchList]);

    useEffect(() => {
        if (!show) {
            focusedRef.current = false;
            return undefined;
        }
        if (focusedRef.current) return undefined;
        const id = requestAnimationFrame(() => {
            const popover = document.getElementById('notification-popover');
            const first = listRef.current?.querySelector('button') || popover?.querySelector('button');
            if (first) {
                first.focus();
                focusedRef.current = true;
            }
        });
        return () => cancelAnimationFrame(id);
    }, [show, notifications.length]);

    const close = () => {
        setShow(false);
        buttonRef.current?.focus();
    };

    const markAllRead = async () => {
        try {
            await associago.notifications.markAllRead();
            setNotifications(list => list.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const openNotification = async (n) => {
        if (!n.read) {
            setNotifications(list => list.map(x => (x.id === n.id ? { ...x, read: true } : x)));
            setUnreadCount(c => Math.max(0, c - 1));
            associago.notifications.markAsRead(n.id).catch(error => {
                console.error('Failed to mark as read', error);
                fetchCount();
            });
        }
        const destination = DESTINATIONS[n.relatedEntityType]?.(n.relatedEntityId);
        setShow(false);
        if (destination && shell?.navigate) shell.navigate(...destination);
    };

    const render = (n) => {
        if (!n.messageKey) return { title: n.title, message: n.message };
        const params = parseParams(n.messageParams);
        if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
            params.date = new Date(`${params.date}T00:00:00`).toLocaleDateString(i18n.language);
        }
        if ('name' in params && !params.name) params.name = t('notifications.someone');
        let message = t(`${n.messageKey}.message`, params);
        if (params.reason) message = `${message} ${t('notifications.reason', { reason: params.reason })}`;
        return { title: t(`${n.messageKey}.title`, { ...params, defaultValue: n.title }), message };
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
        const diff = Math.max(0, Math.floor((Date.now() - date) / 1000));
        if (diff < 60) return t('notifications.timeAgo.seconds', { count: diff });
        if (diff < 3600) return t('notifications.timeAgo.minutes', { count: Math.floor(diff / 60) });
        if (diff < 86400) return t('notifications.timeAgo.hours', { count: Math.floor(diff / 3600) });
        return date.toLocaleDateString(i18n.language);
    };

    const badge = unreadCount > 9 ? '9+' : String(unreadCount);
    const buttonLabel = unreadCount > 0
        ? `${t('notifications.title')}, ${t('notifications.unreadCount', { count: unreadCount })}`
        : t('notifications.title');

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className="btn btn-light position-relative ag-notif-trigger"
                aria-label={buttonLabel}
                aria-haspopup="dialog"
                aria-expanded={show}
                aria-controls={show ? 'notification-popover' : undefined}
                onClick={() => setShow(s => !s)}
            >
                <Bell size={18} aria-hidden="true" />
                {unreadCount > 0 && <span className="ag-notif-badge" aria-hidden="true">{badge}</span>}
            </button>
            <Overlay
                target={buttonRef.current}
                show={show}
                placement="bottom-end"
                rootClose
                onHide={(e) => {
                    // The trigger's own click toggles the panel; don't let root-close reopen it.
                    if (e?.target && buttonRef.current?.contains(e.target)) return;
                    close();
                }}
            >
                <Popover id="notification-popover" className="ag-notif-popover" role="dialog" aria-label={t('notifications.title')}>
                    <Popover.Header as="div" className="ag-notif-header">
                        <strong>{t('notifications.title')}</strong>
                        {unreadCount > 0 && (
                            <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={markAllRead}>
                                {t('notifications.markAllRead')}
                            </Button>
                        )}
                    </Popover.Header>
                    <Popover.Body className="p-0">
                        {loadError && notifications.length === 0 ? (
                            <p className="ag-notif-empty" role="alert">{t('notifications.loadError')}</p>
                        ) : notifications.length > 0 ? (
                            <ul className="ag-notif-list" ref={listRef}>
                                {notifications.map(n => {
                                    const { title, message } = render(n);
                                    const Icon = ICONS[n.relatedEntityType] || Info;
                                    return (
                                        <li key={n.id}>
                                            <button type="button" className={`ag-notif-item${n.read ? '' : ' unread'}`} onClick={() => openNotification(n)}>
                                                <span className="ag-notif-icon" aria-hidden="true"><Icon size={16} /></span>
                                                <span className="ag-notif-text">
                                                    <span className="ag-notif-title">
                                                        {!n.read && <span className="visually-hidden">{t('notifications.unread')}: </span>}
                                                        {title}
                                                    </span>
                                                    {message && <span className="ag-notif-message">{message}</span>}
                                                    <time className="ag-notif-time" dateTime={n.createdAt}>{formatTime(n.createdAt)}</time>
                                                </span>
                                                {!n.read && <span className="ag-notif-dot" aria-hidden="true" />}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="ag-notif-empty">{t('notifications.empty')}</p>
                        )}
                    </Popover.Body>
                </Popover>
            </Overlay>
        </>
    );
}
