const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    ACTION: 'ACTION' // Per le azioni utente
};

class Logger {
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();

        const style = {
            INFO: 'color: #0d6efd; font-weight: bold;',
            WARN: 'color: #ffc107; font-weight: bold;',
            ERROR: 'color: #dc3545; font-weight: bold;',
            ACTION: 'color: #198754; font-weight: bold;'
        };

        console.log(`%c${level}`, style[level], `[${timestamp}] ${message}`, data ? data : '');

        // Qui si potrebbe aggiungere l'invio al processo Main di Electron per salvare su file
        if (window.electron && window.electron.ipcRenderer) {
             // window.electron.ipcRenderer.send('log-message', { level, message, data, timestamp });
        }
    }

    static info(message, data) {
        this.log(LOG_LEVELS.INFO, message, data);
    }

    static warn(message, data) {
        this.log(LOG_LEVELS.WARN, message, data);
    }

    static error(message, data) {
        this.log(LOG_LEVELS.ERROR, message, data);
    }

    static action(actionName, details) {
        this.log(LOG_LEVELS.ACTION, `User Action: ${actionName}`, details);
    }
}

export default Logger;
