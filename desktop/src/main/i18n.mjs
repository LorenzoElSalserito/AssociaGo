// Minimal translator for the Electron main process (dialogs, splash status).
// The UI language chosen in the renderer is persisted by the caller and passed
// to setLanguage(); before that, the OS locale decides, with Italian as fallback.

export const SUPPORTED_LANGUAGES = ['it', 'en', 'de', 'es', 'fr'];
export const FALLBACK_LANGUAGE = 'it';

export const messages = {
    it: {
        'splash.loading': 'Caricamento in corso…',
        'splash.startingJava': 'Avvio del backend Java…',
        'splash.startingBackend': 'Avvio backend…',
        'splash.startingBackendElapsed': 'Avvio backend… ({{seconds}}s, può richiedere alcuni minuti)',
        'splash.checkingBackend': 'Verifica backend…',
        'splash.healthCheck': 'Controllo disponibilità backend… ({{seconds}}s)',
        'splash.ready': 'Backend pronto. Caricamento interfaccia…',
        'javaMissing.title': 'AssociaGo - Java non trovato',
        'javaMissing.message': 'AssociaGo non riesce a trovare una runtime Java.\n\nIl pacchetto avrebbe dovuto includere una JRE integrata. Come soluzione alternativa installa Java 21 (https://adoptium.net) e riavvia l’applicazione.\n\nLog: {{log}}',
        'backendMissing.title': 'AssociaGo - Backend mancante',
        'backendMissing.message': 'AssociaGo non riesce a trovare il backend (file .jar) all’interno del pacchetto.\n\n{{hint}}\n\nLog: {{log}}',
        'backendMissing.devHint': 'Esegui ./gradlew bootJar dalla cartella del progetto, poi riavvia npm run dev.',
        'backendMissing.packageHint': 'Il pacchetto risulta incompleto. Reinstalla l’applicazione.',
        'spawnFailed.title': 'AssociaGo - Avvio backend fallito',
        'spawnFailed.message': 'Impossibile avviare il processo Java.\n\nDettaglio: {{error}}\n\nLog: {{log}}',
        'backendTimeout.title': 'AssociaGo - Il backend non risponde',
        'backendTimeout.message': 'Il backend Java non si è avviato entro il tempo previsto.\n\nVerifica i log dettagliati:\n{{log}}\n\nIncolla il contenuto del file più recente per ottenere supporto.',
        'backendUnhealthy.message': 'Il backend non risponde al controllo di disponibilità. Log: {{log}}',
        'startupError.title': 'AssociaGo - Errore di avvio',
        'startupError.message': 'Impossibile avviare il servizio backend di AssociaGo.\n{{error}}',
        'dialog.exportJson': 'AssociaGo - Esporta dati (JSON)',
        'dialog.importJson': 'AssociaGo - Importa dati (JSON)',
        'dialog.exportDb': 'AssociaGo - Esporta database',
        'dialog.importDb': 'AssociaGo - Importa database',
        'dialog.export': 'Esporta',
        'dialog.import': 'Importa',
        'dialog.sqliteFilter': 'Database SQLite',
        'dialog.dbNotFound': 'Database non trovato in {{path}}',
        'dialog.dbImported': 'Database importato. Riavvia l’applicazione per applicare le modifiche.'
    },
    en: {
        'splash.loading': 'Loading…',
        'splash.startingJava': 'Starting Java backend…',
        'splash.startingBackend': 'Starting backend…',
        'splash.startingBackendElapsed': 'Starting backend… ({{seconds}}s, this may take a few minutes)',
        'splash.checkingBackend': 'Checking backend…',
        'splash.healthCheck': 'Backend health check… ({{seconds}}s)',
        'splash.ready': 'Backend ready. Loading interface…',
        'javaMissing.title': 'AssociaGo - Java not found',
        'javaMissing.message': 'AssociaGo cannot find a Java runtime.\n\nThe package should have included a bundled JRE. As a workaround, install Java 21 (https://adoptium.net) and restart the application.\n\nLog: {{log}}',
        'backendMissing.title': 'AssociaGo - Backend missing',
        'backendMissing.message': 'AssociaGo cannot find the backend (.jar file) inside the package.\n\n{{hint}}\n\nLog: {{log}}',
        'backendMissing.devHint': 'Run ./gradlew bootJar from the project folder, then restart npm run dev.',
        'backendMissing.packageHint': 'The package is incomplete. Reinstall the application.',
        'spawnFailed.title': 'AssociaGo - Backend start failed',
        'spawnFailed.message': 'Unable to start the Java process.\n\nDetails: {{error}}\n\nLog: {{log}}',
        'backendTimeout.title': 'AssociaGo - Backend not responding',
        'backendTimeout.message': 'The Java backend did not start within the timeout.\n\nCheck the detailed logs:\n{{log}}\n\nPaste the content of the most recent file to get support.',
        'backendUnhealthy.message': 'The backend does not respond to the health check. Log: {{log}}',
        'startupError.title': 'AssociaGo - Startup error',
        'startupError.message': 'Failed to start the AssociaGo backend service.\n{{error}}',
        'dialog.exportJson': 'AssociaGo - Export data (JSON)',
        'dialog.importJson': 'AssociaGo - Import data (JSON)',
        'dialog.exportDb': 'AssociaGo - Export database',
        'dialog.importDb': 'AssociaGo - Import database',
        'dialog.export': 'Export',
        'dialog.import': 'Import',
        'dialog.sqliteFilter': 'SQLite database',
        'dialog.dbNotFound': 'Database not found in {{path}}',
        'dialog.dbImported': 'Database imported. Restart the application to apply the changes.'
    },
    de: {
        'splash.loading': 'Wird geladen…',
        'splash.startingJava': 'Java-Backend wird gestartet…',
        'splash.startingBackend': 'Backend wird gestartet…',
        'splash.startingBackendElapsed': 'Backend wird gestartet… ({{seconds}} s, kann einige Minuten dauern)',
        'splash.checkingBackend': 'Backend wird geprüft…',
        'splash.healthCheck': 'Verfügbarkeitsprüfung des Backends… ({{seconds}} s)',
        'splash.ready': 'Backend bereit. Oberfläche wird geladen…',
        'javaMissing.title': 'AssociaGo - Java nicht gefunden',
        'javaMissing.message': 'AssociaGo findet keine Java-Laufzeitumgebung.\n\nDas Paket hätte eine integrierte JRE enthalten sollen. Installiere als Ausweichlösung Java 21 (https://adoptium.net) und starte die Anwendung neu.\n\nLog: {{log}}',
        'backendMissing.title': 'AssociaGo - Backend fehlt',
        'backendMissing.message': 'AssociaGo findet das Backend (.jar-Datei) im Paket nicht.\n\n{{hint}}\n\nLog: {{log}}',
        'backendMissing.devHint': 'Führe ./gradlew bootJar im Projektordner aus und starte dann npm run dev neu.',
        'backendMissing.packageHint': 'Das Paket ist unvollständig. Installiere die Anwendung neu.',
        'spawnFailed.title': 'AssociaGo - Backend-Start fehlgeschlagen',
        'spawnFailed.message': 'Der Java-Prozess konnte nicht gestartet werden.\n\nDetails: {{error}}\n\nLog: {{log}}',
        'backendTimeout.title': 'AssociaGo - Backend antwortet nicht',
        'backendTimeout.message': 'Das Java-Backend wurde nicht innerhalb der Zeitüberschreitung gestartet.\n\nPrüfe die ausführlichen Logs:\n{{log}}\n\nFüge den Inhalt der neuesten Datei ein, um Unterstützung zu erhalten.',
        'backendUnhealthy.message': 'Das Backend antwortet nicht auf die Verfügbarkeitsprüfung. Log: {{log}}',
        'startupError.title': 'AssociaGo - Startfehler',
        'startupError.message': 'Der AssociaGo-Backend-Dienst konnte nicht gestartet werden.\n{{error}}',
        'dialog.exportJson': 'AssociaGo - Daten exportieren (JSON)',
        'dialog.importJson': 'AssociaGo - Daten importieren (JSON)',
        'dialog.exportDb': 'AssociaGo - Datenbank exportieren',
        'dialog.importDb': 'AssociaGo - Datenbank importieren',
        'dialog.export': 'Exportieren',
        'dialog.import': 'Importieren',
        'dialog.sqliteFilter': 'SQLite-Datenbank',
        'dialog.dbNotFound': 'Datenbank nicht gefunden in {{path}}',
        'dialog.dbImported': 'Datenbank importiert. Starte die Anwendung neu, um die Änderungen zu übernehmen.'
    },
    es: {
        'splash.loading': 'Cargando…',
        'splash.startingJava': 'Iniciando el backend Java…',
        'splash.startingBackend': 'Iniciando backend…',
        'splash.startingBackendElapsed': 'Iniciando backend… ({{seconds}} s, puede tardar unos minutos)',
        'splash.checkingBackend': 'Comprobando backend…',
        'splash.healthCheck': 'Comprobación de disponibilidad del backend… ({{seconds}} s)',
        'splash.ready': 'Backend listo. Cargando la interfaz…',
        'javaMissing.title': 'AssociaGo - Java no encontrado',
        'javaMissing.message': 'AssociaGo no encuentra un entorno de ejecución Java.\n\nEl paquete debería incluir un JRE integrado. Como alternativa, instala Java 21 (https://adoptium.net) y reinicia la aplicación.\n\nRegistro: {{log}}',
        'backendMissing.title': 'AssociaGo - Falta el backend',
        'backendMissing.message': 'AssociaGo no encuentra el backend (archivo .jar) dentro del paquete.\n\n{{hint}}\n\nRegistro: {{log}}',
        'backendMissing.devHint': 'Ejecuta ./gradlew bootJar desde la carpeta del proyecto y reinicia npm run dev.',
        'backendMissing.packageHint': 'El paquete está incompleto. Reinstala la aplicación.',
        'spawnFailed.title': 'AssociaGo - Error al iniciar el backend',
        'spawnFailed.message': 'No se pudo iniciar el proceso Java.\n\nDetalle: {{error}}\n\nRegistro: {{log}}',
        'backendTimeout.title': 'AssociaGo - El backend no responde',
        'backendTimeout.message': 'El backend Java no se inició dentro del tiempo previsto.\n\nRevisa los registros detallados:\n{{log}}\n\nPega el contenido del archivo más reciente para obtener soporte.',
        'backendUnhealthy.message': 'El backend no responde a la comprobación de disponibilidad. Registro: {{log}}',
        'startupError.title': 'AssociaGo - Error de inicio',
        'startupError.message': 'No se pudo iniciar el servicio backend de AssociaGo.\n{{error}}',
        'dialog.exportJson': 'AssociaGo - Exportar datos (JSON)',
        'dialog.importJson': 'AssociaGo - Importar datos (JSON)',
        'dialog.exportDb': 'AssociaGo - Exportar base de datos',
        'dialog.importDb': 'AssociaGo - Importar base de datos',
        'dialog.export': 'Exportar',
        'dialog.import': 'Importar',
        'dialog.sqliteFilter': 'Base de datos SQLite',
        'dialog.dbNotFound': 'Base de datos no encontrada en {{path}}',
        'dialog.dbImported': 'Base de datos importada. Reinicia la aplicación para aplicar los cambios.'
    },
    fr: {
        'splash.loading': 'Chargement…',
        'splash.startingJava': 'Démarrage du backend Java…',
        'splash.startingBackend': 'Démarrage du backend…',
        'splash.startingBackendElapsed': 'Démarrage du backend… ({{seconds}} s, cela peut prendre quelques minutes)',
        'splash.checkingBackend': 'Vérification du backend…',
        'splash.healthCheck': 'Contrôle de disponibilité du backend… ({{seconds}} s)',
        'splash.ready': 'Backend prêt. Chargement de l’interface…',
        'javaMissing.title': 'AssociaGo - Java introuvable',
        'javaMissing.message': 'AssociaGo ne trouve aucun environnement d’exécution Java.\n\nLe paquet aurait dû inclure un JRE intégré. En solution de repli, installez Java 21 (https://adoptium.net) et redémarrez l’application.\n\nJournal : {{log}}',
        'backendMissing.title': 'AssociaGo - Backend manquant',
        'backendMissing.message': 'AssociaGo ne trouve pas le backend (fichier .jar) dans le paquet.\n\n{{hint}}\n\nJournal : {{log}}',
        'backendMissing.devHint': 'Exécutez ./gradlew bootJar depuis le dossier du projet, puis relancez npm run dev.',
        'backendMissing.packageHint': 'Le paquet est incomplet. Réinstallez l’application.',
        'spawnFailed.title': 'AssociaGo - Échec du démarrage du backend',
        'spawnFailed.message': 'Impossible de démarrer le processus Java.\n\nDétail : {{error}}\n\nJournal : {{log}}',
        'backendTimeout.title': 'AssociaGo - Le backend ne répond pas',
        'backendTimeout.message': 'Le backend Java n’a pas démarré dans le délai imparti.\n\nConsultez les journaux détaillés :\n{{log}}\n\nCollez le contenu du fichier le plus récent pour obtenir de l’aide.',
        'backendUnhealthy.message': 'Le backend ne répond pas au contrôle de disponibilité. Journal : {{log}}',
        'startupError.title': 'AssociaGo - Erreur de démarrage',
        'startupError.message': 'Impossible de démarrer le service backend d’AssociaGo.\n{{error}}',
        'dialog.exportJson': 'AssociaGo - Exporter les données (JSON)',
        'dialog.importJson': 'AssociaGo - Importer les données (JSON)',
        'dialog.exportDb': 'AssociaGo - Exporter la base de données',
        'dialog.importDb': 'AssociaGo - Importer la base de données',
        'dialog.export': 'Exporter',
        'dialog.import': 'Importer',
        'dialog.sqliteFilter': 'Base de données SQLite',
        'dialog.dbNotFound': 'Base de données introuvable dans {{path}}',
        'dialog.dbImported': 'Base de données importée. Redémarrez l’application pour appliquer les modifications.'
    }
};

// 'pt-BR' -> null, 'de-AT' -> 'de', 'EN' -> 'en'
export function normalizeLanguage(value) {
    const base = String(value || '').trim().toLowerCase().split(/[-_]/)[0];
    return SUPPORTED_LANGUAGES.includes(base) ? base : null;
}

export function createTranslator(initialLanguage) {
    let language = normalizeLanguage(initialLanguage) || FALLBACK_LANGUAGE;
    const tr = (key, params = {}) => {
        const template = messages[language][key] ?? messages[FALLBACK_LANGUAGE][key] ?? key;
        return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (name in params ? String(params[name]) : match));
    };
    tr.setLanguage = (value) => {
        const next = normalizeLanguage(value);
        if (next) language = next;
        return language;
    };
    tr.getLanguage = () => language;
    return tr;
}
