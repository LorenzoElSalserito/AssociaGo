import React from "react";

/**
 * TopHeader - Barra superiore dell'applicazione
 *
 * @param {Object} props
 * @param {string} props.title - Titolo della pagina corrente
 * @param {React.ReactNode} props.actions - Azioni da mostrare a destra (es. bottoni, menu)
 */
export default function TopHeader({ title, actions }) {
    return (
        <header className="top-header">
            <div className="top-header-title">
                <h4 className="mb-0">{title}</h4>
            </div>
            <div className="top-header-actions">
                {actions}
            </div>

            <style>{`
                .top-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    background-color: #ffffff;
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    height: 70px;
                    position: sticky;
                    top: 0;
                    z-index: 99;
                }

                .top-header-title h4 {
                    font-weight: 600;
                    color: #343a40;
                }

                .top-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
            `}</style>
        </header>
    );
}
