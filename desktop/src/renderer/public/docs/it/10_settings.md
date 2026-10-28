# 10. Impostazioni e database

Le **Impostazioni** si aprono dalla barra laterale oppure dal menu associazione, in alto a destra. Le schede sono sette: **Profilo Associazione**, **Finanze**, **Generale**, **Anagrafica**, **Firme**, **Database** e **Registro attività**.

## 10.1 Profilo Associazione

Per cambiare i dati premi **Modifica Profilo** e, quando hai finito, **Salva Modifiche**.
- **Identità**: Nome Associazione, Tipo, Codice Fiscale, Partita IVA, Data di Fondazione.
- **Contatti**: Email, Telefono, Indirizzo, Città, Provincia, CAP.
- **Organigramma**: Presidente, Vice Presidente, Segretario, Tesoriere. Questi nomi finiscono nei documenti ufficiali: bilancio consuntivo e firmatari degli attestati.
- **Documenti**: Percorso/Link Statuto e Percorso/Link Regolamento.
- **Logo Associazione**: premi **Carica Nuovo** e scegli un PNG o JPG. È consigliato 500×500 px.
- **Configurazione**: Formato Numero Tessera (`YYYY` per l'anno, `####` per il numero progressivo) e Quota Associativa Base.

> Il formato tessera e la quota base vengono salvati, ma il modulo socio non li applica ancora in automatico (vedi capitolo 2).

## 10.2 Finanze

Qui gestisci i **Metodi di Pagamento** con **Aggiungi Metodo**:
- **Nome Metodo**;
- **Tipo**: Contanti, Bonifico Bancario, Pagamento Online, Altro;
- **Attivo**, cioè se il metodo è disponibile nelle transazioni;
- **Applica Commissione**, con **Commissione Fissa (€)** e/o **Commissione Percentuale (%)**.

Ogni metodo si può modificare o eliminare.

## 10.3 Generale

- **Lingua**: Italiano, Inglese, Spagnolo, Tedesco, Francese.
- **Tema**: Chiaro o Scuro. La scelta vale dopo **Salva Preferenze**. Il pulsante sole/luna nella barra superiore cambia il tema all'istante.
- **Zoom interfaccia**: 50%, 75%, 100%, 125%, 150%, 175% o 200%. Si applica subito e viene ricordato.
- **Gestione Dati**: **Esegui Backup Ora** (vedi 10.6).
- **Informazioni App**: versione, licenza, avvertenze, **Segnala Bug** (apre una email già compilata con la versione) e il riquadro **Supporta AssociaGo** con **Sostieni Donando**.

## 10.4 Anagrafica, Firme e Registro attività

- **Anagrafica**: Sedi, Documenti e Scadenze dell'associazione (vedi capitolo 18).
- **Firme**: le firme istituzionali (vedi capitolo 16).
- **Registro attività**: l'elenco di creazioni, modifiche ed eliminazioni dei dati, con filtri per area, azione e date (vedi capitolo 18).

## 10.5 Database

AssociaGo può lavorare con due tipi di database:

| | **SQLite locale** (predefinito) | **MariaDB remoto** |
|---|---|---|
| Dove sono i dati | In un file sul computer | Su un server MariaDB della tua organizzazione |
| Uso tipico | Una sola postazione | Più postazioni sugli stessi dati |
| Configurazione | Nessuna | Host, porta, database, utente, password |

Il riquadro in alto indica il database in uso: **Attivo: SQLite locale** oppure **Attivo: MariaDB**.

### Collegare un database MariaDB
1. Chiedi all'amministratore un **database vuoto e dedicato** e un utente con permessi di lettura, scrittura e creazione tabelle.
2. Esegui un backup (vedi 10.6).
3. Attiva **Usa Database Remoto** e compila **Host**, **Porta** (in genere 3306), **Nome Database**, **Utente** e **Password**.
4. Se il server lo prevede, attiva **Usa Connessione SSL**. AssociaGo verifica il certificato del server.
5. Premi **Verifica connessione**. AssociaGo apre la connessione e prova a scrivere e rileggere un dato temporaneo. Se va a buon fine compare "Connessione verificata: lettura e scrittura riuscite."
6. Premi **Salva Impostazioni Database**. Il salvataggio ripete la verifica: se le credenziali sono errate, la configurazione non viene salvata.
7. **Chiudi e riapri AssociaGo.** La nuova connessione si attiva solo alla riapertura.

Alla prima apertura su un database vuoto, AssociaGo crea le tabelle e mostra il modulo di primo avvio (capitolo 1) per creare l'associazione sul server.

### Cose da sapere
- **I dati non vengono trasferiti.** SQLite locale e MariaDB restano due archivi separati. Per portare i soci da uno all'altro usa l'export e import CSV/JSON (capitolo 2).
- Per tornare a SQLite disattiva **Usa Database Remoto**, salva e riapri l'app. I dati locali sono ancora lì.
- La password del database non viene mai mostrata di nuovo. Se lasci il campo vuoto e non cambi host, utente e database, resta valida quella salvata.
- Gli errori di connessione non mostrano indirizzi interni né credenziali.

## 10.6 Backup

**Esegui Backup Ora** (Impostazioni › Generale) salva una copia del database nella cartella `backups` dei dati di AssociaGo (`~/.associago/backups` per impostazione predefinita). Al termine compare il percorso del file.

- **SQLite**: una copia coerente del database (`.db`), creata anche mentre l'app è in uso.
- **MariaDB**: un'istantanea in formato JSON (`.json`) di tutte le tabelle.

Il backup comprende solo il database: loghi e file esterni non sono inclusi.

> Il ripristino non è automatico. Per SQLite, a app chiusa, sostituisci il file del database con la copia. L'istantanea JSON di MariaDB serve come archivio e non si importa dall'interfaccia.
