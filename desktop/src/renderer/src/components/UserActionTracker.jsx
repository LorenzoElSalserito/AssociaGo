import React, { useEffect } from 'react';
import Logger from '../utils/Logger';

const UserActionTracker = ({ children }) => {
    useEffect(() => {
        const handleClick = (event) => {
            // Cerca di identificare l'elemento cliccato in modo utile
            let target = event.target;
            let elementInfo = target.tagName;

            if (target.id) elementInfo += `#${target.id}`;
            if (target.className && typeof target.className === 'string') {
                 // Prendi solo le prime classi per non intasare il log
                 const classes = target.className.split(' ').slice(0, 3).join('.');
                 if (classes) elementInfo += `.${classes}`;
            }

            // Cerca se è un bottone o un link o un input
            const isInteractive = target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select');

            if (isInteractive) {
                const interactiveEl = target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select');
                const text = interactiveEl.innerText || interactiveEl.value || interactiveEl.name || 'No text';
                Logger.action('CLICK', { element: elementInfo, text: text.substring(0, 50) });
            }
        };

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, []);

    return <>{children}</>;
};

export default UserActionTracker;
