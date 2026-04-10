# 18. Conformità e Audit

La sezione **Audit** registra automaticamente tutte le operazioni sensibili effettuate sulla piattaforma, garantendo la tracciabilità completa richiesta dalla normativa del Terzo Settore.

## 18.1 Cos'è l'Audit Log
L'audit log è un registro immutabile che documenta:
- **Chi** ha effettuato l'operazione (utente).
- **Cosa** è stato fatto (tipo di azione).
- **Quando** è avvenuto (timestamp preciso).
- **Su quale entità** è stata effettuata l'azione (socio, transazione, evento, ecc.).
- **Quali valori** sono cambiati (prima/dopo, quando disponibile).

## 18.2 Operazioni Tracciate
Il sistema registra automaticamente le operazioni più rilevanti, tra cui:
- Creazione, modifica ed eliminazione di soci.
- Registrazione e modifica di transazioni finanziarie.
- Creazione e invio di comunicazioni.
- Approvazione di bilanci.
- Emissione di attestati.
- Modifiche alle impostazioni dell'associazione.
- Gestione delle presenze.

## 18.3 Consultazione del Log

### Accesso
Il log di audit è consultabile tramite le API del sistema. Le informazioni disponibili includono:

### Filtri Disponibili
- **Per associazione**: Visualizza solo le operazioni di una specifica associazione.
- **Per entità**: Filtra per tipo di entità (es. "MEMBER", "TRANSACTION") e ID specifico.
- **Per data**: Seleziona un intervallo temporale con date di inizio e fine.
- **Per utente**: Filtra le azioni di un utente specifico.

### Paginazione
I risultati sono paginati per gestire grandi volumi di dati. È possibile specificare:
- **Pagina**: Numero della pagina corrente.
- **Dimensione**: Numero di record per pagina (default 50).

## 18.4 Conteggio Operazioni
È disponibile un endpoint per ottenere il conteggio totale delle operazioni registrate per un'associazione, utile per dashboard e statistiche.

## 18.5 Caratteristiche Tecniche
- **Transazione indipendente**: Ogni voce di audit viene scritta in una transazione separata. Anche se l'operazione principale fallisce, il tentativo viene comunque registrato nel log.
- **Immutabilità**: Le voci di audit non possono essere modificate o eliminate.
- **Indicizzazione**: Il log è indicizzato per associazione, entità, utente e data per garantire ricerche rapide.

## 18.6 Importanza per il Terzo Settore
La tracciabilità delle operazioni è un requisito fondamentale per:
- **Revisione legale**: Gli enti con ricavi superiori a determinati importi sono soggetti a revisione.
- **Controlli fiscali**: L'Agenzia delle Entrate può richiedere documentazione dettagliata.
- **Trasparenza**: I soci hanno diritto di accesso ai documenti associativi.
- **Compliance GDPR**: Il log documenta chi ha effettuato operazioni sui dati personali.

> **Nota**: L'audit log è una funzionalità interna di sicurezza. L'accesso al log dovrebbe essere limitato agli amministratori dell'associazione e ai revisori dei conti.
