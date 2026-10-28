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
        ...shell.pages.map(page => ({ ...page, action: () => shell.navigate(page.id) })),
        { id: 'new-member', label: t('New Member'), action: () => shell.openModal('member-form', {
            associationId: shell.currentAssociationId, associationType: shell.currentAssociation?.tipo
        }) }
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
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Gestione tastiera
    const handleKeyDown = (e) => {
        if (!filteredCommands.length) return;
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
                        aria-label={t("navigation.search")}
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
                                data-command-id={cmd.id}
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
                .command-list .list-group-item.active {
                    background-color: var(--brand-primary);
                    border-color: var(--brand-primary);
                }
            `}</style>
        </Modal>
    );
}
