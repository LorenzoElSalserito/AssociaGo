# AssociaGo — rapporto di verifica UI e database

Versione: **0.1.6, modifiche Unreleased**. Data: **16 ottobre 2026**.

## Esito e perimetro

La suite applicativa comprende **67 scenari E2E su SQLite e gli stessi 67 su MariaDB**. Tutti superati. Usa Electron e Spring Boot reali, con dati generati in cartelle temporanee; nessun database dell’utente viene utilizzato. L’interruzione di rete è simulata deliberatamente per verificare il recupero. I link PayPal vengono aperti nel gestore delle finestre esterne e intercettati prima di raggiungere il sito.

Questa è una verifica tecnica riproducibile del perimetro elencato, non una certificazione esterna né una garanzia su ogni combinazione possibile di dati, sistemi operativi o servizi remoti.

## Matrice E2E

| Area | Verifica |
|---|---|
| Accesso | Password valida su backend reale, logout e riapertura |
| Navigazione | Tutte le 16 destinazioni in tema chiaro/scuro, sidebar compressa, palette e scorciatoia tastiera |
| Dashboard | Tre KPI con collegamenti, attività recenti, espansione elenco, tutte le azioni rapide |
| Soci | Apertura modulo, modifica persistente senza duplicati, rinnovo, ricerca |
| Attività/eventi | Dettagli, tutte le schede, accesso ai moduli di partecipanti, orari, istruttori e costi |
| Assemblee | Dettagli, schede e moduli; registrazione effettiva di una presenza |
| Inventario | Dettagli, storico e registrazione effettiva di un prestito |
| Volontari | Dettagli, turni/rimborsi, salvataggio effettivo di un turno |
| Presenze | Creazione sessione, stato partecipante, modifica, riapertura e cancellazione |
| Finanze/budget/bilancio | Schede e moduli, dettaglio budget e accesso alle righe |
| Attestati/comunicazioni | Schede, apertura modelli, emissione e composizione |
| CSV/JSON soci | Download degli esempi e degli export reali, anteprima, import, Unicode, virgolette, righe multiple, duplicati, blocco dati non validi |
| Impostazioni | Tutte le schede, profilo, metodi pagamento, registri, firme, configurazione database |
| Backup | File SQLite valido; snapshot JSON MariaDB contenente dati reali |
| Donazione | URL esatto in impostazioni e Info App; nessuna transazione effettuata |
| Connessione | Avviso dopo interruzione, riconnessione e nuova lettura senza riavviare la UI |
| Zoom | 50, 75, 100, 125, 150, 175, 200%; navigazione a 200%; preferenza persistente |
| Layout/movimento | 1440×1000, 1366×768, 1280×720; rispetto di `prefers-reduced-motion` |
| Errori | Nessuna eccezione JavaScript non gestita e nessun errore HTTP inatteso nei percorsi visitati |

L’apertura dei moduli certifica la **raggiungibilità**. Le righe che indicano salvataggio/import/modifica certificano anche la persistenza; non sono equivalenti a una prova di tutte le operazioni CRUD di ogni modulo.

## Compatibilità SQLite / MariaDB

- SQLite JDBC **3.46.1.3**; MariaDB Server **11.8.6**, eseguito su `127.0.0.1` con dati e runtime sotto `/tmp/associago-mariadb`.
- Migrazioni SQLite incrementali V33–V37 conservano record storici, voti, fatture, presenze e prestiti. Test dedicati verificano valori e identificativi dopo l’upgrade.
- MariaDB usa una baseline distinta, ricavata dai mapping JPA e integrata con vincoli relazionali compatibili. Hibernate verifica lo schema remoto all’avvio. SQLite abilita le chiavi esterne sulle connessioni.
- Verificati riavvio, conservazione delle iscrizioni, logo e firma binari oltre 255 byte, somma monetaria `0.10 + 0.20 = 0.30`, controlli fatture e scambio JSON soci tra i due motori.
- Configurazione remota effettua una verifica reale di lettura/scrittura tramite tabella temporanea. Password non restituita dalle API; configurazione locale salvata atomicamente con permessi del solo proprietario dove supportati.
- TLS opzionale usa `sslMode=verify-full`, secondo la [documentazione MariaDB Connector/J](https://mariadb.com/docs/connectors/mariadb-connector-j/using-tls-ssl-with-mariadb-java-connector). La prova locale è senza TLS: certificati di un server reale richiedono verifica nell’ambiente di destinazione.
- Il cambio connessione richiede chiusura e riapertura dell’app e **non trasferisce automaticamente l’intero database**. I database restano separati. Il trasferimento CSV/JSON implementato riguarda soci e iscrizioni.
- Backup: SQLite produce una copia consistente del database; MariaDB produce uno snapshot logico JSON consistente. Allegati esterni esclusi. Il JSON di backup MariaDB non coincide con il formato di importazione soci e non costituisce un ripristino automatico già verificato.

Il motore MariaDB 11.8.6 supera queste prove; la versione Flyway inclusa avverte che la sua matrice ufficiale arriva a MariaDB 11.2. Non si estende quindi l’esito a qualsiasi versione MariaDB o MySQL.

## Riproduzione

Prerequisiti: Java 21, Node/npm, dipendenze progetto, Electron e display grafico oppure Xvfb. Non è necessario installare il server MariaDB nel sistema: i test effettuati usano pacchetti estratti in una cartella temporanea.

```bash
GRADLE_USER_HOME="$PWD/.gradle-local" ./gradlew check bootJar
npm test --prefix desktop
npm run build --prefix desktop
xvfb-run -a node desktop/test/ui-e2e.cjs
xvfb-run -a node desktop/test/setup-wizard-e2e.cjs
xvfb-run -a node desktop/test/features-e2e.cjs
xvfb-run -a node desktop/test/backend-startup-e2e.cjs
```

Per MariaDB creare un database **vuoto e dedicato**, chiamato `associago_e2e` oppure `associago_e2e_*`, su loopback. Il runner rifiuta host esterni e nomi non dedicati. Passare un file temporaneo con permessi `0600`:

```json
{
  "configured": true,
  "dbType": "MARIADB",
  "dbHost": "127.0.0.1",
  "dbPort": "33379",
  "dbName": "associago_e2e",
  "dbUser": "utente_test",
  "dbPassword": "password_del_solo_ambiente_test",
  "dbSsl": false
}
```

```bash
ASSOCIAGO_E2E_DB_CONFIG=/tmp/associago-test-config.json \
  xvfb-run -a node desktop/test/ui-e2e.cjs
```

Il percorso utente completo verso il database remoto (SQLite → configurazione MariaDB da Impostazioni con credenziali errate e corrette → riapertura su MariaDB vuoto con migrazioni e primo avvio → socio persistente dopo un'altra riapertura → ritorno a SQLite con dati locali intatti) usa un **secondo** database vuoto dedicato. Il client `mariadb` è facoltativo e abilita anche i controlli diretti su schema e righe:

```bash
ASSOCIAGO_E2E_DB_CONFIG=/tmp/associago-remote-config.json \
ASSOCIAGO_E2E_MARIADB_CLIENT="mariadb --no-defaults -S /percorso/mysqld.sock -uroot" \
  xvfb-run -a node desktop/test/remote-db-e2e.cjs
```

Il test non svuota database esistenti: per ripeterlo serve un nuovo database di test vuoto. I test aggiungono dati e file esclusivamente negli ambienti dichiarati.

## Evidenze

- Report E2E: `desktop/test-results/ui/report.json`, `desktop/test-results/ui-mariadb/report.json`, `desktop/test-results/setup-wizard/report.json` e `desktop/test-results/remote-db/report.json`.
- Screenshot chiari/scuri e formati schermo nelle stesse cartelle; log backend disponibili accanto ai report.
- Report avvio e interoperabilità: `desktop/test-results/startup-sqlite.json` e `desktop/test-results/startup-mariadb.json`.
- Report JUnit e Checkstyle: `build/reports/tests/test/` e `build/reports/checkstyle/`.
- I risultati generati sono esclusi da Git; questo documento e i test sono versionabili.

Build e suite superate: **43 test desktop**, **22 test backend**; un test backend opzionale di generazione schema è saltato nell’esecuzione normale. Verifiche aggiuntive di riavvio e scambio dati bidirezionale superate su entrambi i motori. Checkstyle segnala avvisi di stile non bloccanti, secondo la configurazione esistente del progetto. Il test di generazione schema MariaDB è opzionale e rimane escluso dalle esecuzioni normali.

## Limiti della verifica

Non eseguiti: pagamenti PayPal reali, invii email a destinatari esterni, server remoti di produzione, certificati TLS del futuro server, pacchetti installati su Windows/macOS, restore completo di tutti gli allegati, carichi massivi o concorrenza multiutente. Le prove non autorizzano a dichiarare queste aree certificate.
