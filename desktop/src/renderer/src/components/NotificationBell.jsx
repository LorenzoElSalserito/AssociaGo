import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { OverlayTrigger, Popover, Badge, ListGroup, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

export default function NotificationBell({ userId }) {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const data = await associago.notifications.getUserNotifications(userId);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAllRead = async () => {
        try {
            await associago.notifications.markAllAsRead(userId);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await associago.notifications.markAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return t('notifications.timeAgo.seconds', { count: diff });
        if (diff < 3600) return t('notifications.timeAgo.minutes', { count: Math.floor(diff / 60) });
        if (diff < 86400) return t('notifications.timeAgo.hours', { count: Math.floor(diff / 3600) });
        return date.toLocaleDateString();
    };

    const popover = (
        <Popover id="notification-popover" style={{ width: '320px', maxWidth: '100%' }}>
            <Popover.Header as="div" className="d-flex justify-content-between align-items-center bg-white border-bottom p-3">
                <strong className="mb-0">{t('notifications.title')}</strong>
                {unreadCount > 0 && (
                    <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={markAllRead}>
                        {t('notifications.markAllRead')}
                    </Button>
                )}
            </Popover.Header>
            <Popover.Body className="p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                    <ListGroup variant="flush">
                        {notifications.map(n => (
                            <ListGroup.Item
                                key={n.id}
                                className={`p-3 border-bottom ${!n.read ? 'bg-light' : ''}`}
                                onClick={() => !n.read && markAsRead(n.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex justify-content-between mb-1">
                                    <strong className="small text-dark">{n.title}</strong>
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{formatTime(n.createdAt)}</small>
                                </div>
                                <p className="mb-0 small text-secondary">{n.message}</p>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <div className="p-4 text-center text-muted small">
                        {t('notifications.empty')}
                    </div>
                )}
            </Popover.Body>
        </Popover>
    );

    return (
        <OverlayTrigger trigger="click" placement="bottom-end" overlay={popover} rootClose>
            <button className="btn btn-icon position-relative p-2 rounded-circle hover-bg-light transition-all">
                <Bell size={20} className="text-secondary" />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span className="visually-hidden">{t('notifications.newAlerts')}</span>
                    </span>
                )}
            </button>
        </OverlayTrigger>
    );
}
