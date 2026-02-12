import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, ListGroup } from 'react-bootstrap';
import { Search, ArrowRight, Command } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * CommandPalette - Finestra di comando globale (Ctrl+K / Cmd+K)
 *
 * Permette di navigare rapidamente tra le pagine e eseguire azioni.
 */
export default function CommandPalette({ shell, isOpen, onClose }) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Lista comandi base
    const commands = [
        { id: 'dashboard', label: t('nav.dashboard'), icon: 'LayoutDashboard', action: () => shell.navigate('dashboard') },
        { id: 'members', label: t('nav.members'), icon: 'Users', action: () => shell.navigate('members') },
        { id: 'activities', label: t('nav.activities'), icon: 'Calendar', action: () => shell.navigate('activities') },
        { id: 'events', label: t('nav.events'), icon: 'Calendar', action: () => shell.navigate('events') },
        { id: 'fiscal', label: t('nav.fiscal'), icon: 'CreditCard', action: () => shell.navigate('fiscal') },
        { id: 'settings', label: t('nav.settings'), icon: 'Settings', action: () => shell.navigate('settings') },
        { id: 'new-member', label: t('New Member'), icon: 'UserPlus', action: () => { shell.navigate('members'); /* TODO: Open modal */ } },
    ];

    // Filtra comandi
    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    // Reset selezione quando cambia query
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Focus input all'apertura
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Gestione tastiera
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                onClose();
            }
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg" className="command-palette-modal">
            <Modal.Body className="p-0">
                <div className="d-flex align-items-center p-3 border-bottom">
                    <Search size={20} className="text-muted me-3" />
                    <Form.Control
                        ref={inputRef}
                        type="text"
                        placeholder={t('Type a command or search...')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border-0 shadow-none p-0 fs-5"
                        autoComplete="off"
                    />
                    <div className="text-muted small border px-2 py-1 rounded">Esc</div>
                </div>

                <ListGroup variant="flush" className="command-list">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <ListGroup.Item
                                key={cmd.id}
                                action
                                active={index === selectedIndex}
                                onClick={() => { cmd.action(); onClose(); }}
                                className="d-flex align-items-center justify-content-between py-3 border-0"
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="d-flex align-items-center">
                                    {/* Icon placeholder - in real app use dynamic icon component */}
                                    <div className={`me-3 text-${index === selectedIndex ? 'white' : 'muted'}`}>
                                        <ArrowRight size={16} />
                                    </div>
                                    <span className="fw-medium">{cmd.label}</span>
                                </div>
                                {index === selectedIndex && <span className="small text-white-50">Enter</span>}
                            </ListGroup.Item>
                        ))
                    ) : (
                        <div className="p-4 text-center text-muted">
                            {t('No commands found.')}
                        </div>
                    )}
                </ListGroup>
            </Modal.Body>
            <style>{`
                .command-palette-modal .modal-content {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                    border: none;
                }
                .command-list {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .list-group-item.active {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
            `}</style>
        </Modal>
    );
}
