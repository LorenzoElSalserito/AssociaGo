# 1. AssociaGo: introduzione, accesso e interfaccia

**AssociaGo** è il gestionale desktop per associazioni (APS, ASD, ODV, ETS). I dati restano in un database locale SQLite, oppure in un database MariaDB della tua organizzazione (vedi capitolo 10).

Questo manuale descrive le funzioni così come sono presenti nell'applicazione. Quando una funzione è solo parziale, lo trovi indicato.

## 1.1 Primo avvio e accesso

### Primo avvio: configurare l'associazione
Se sul computer non c'è ancora nessuna associazione, AssociaGo apre il modulo **Configura Nuova Associazione**, diviso in due sezioni:

1. **Dati dell'associazione**: *Nome Associazione*, *Tipo* (APS, ASD, ODV, ETS, Altro) e *Codice Fiscale*. Sotto il campo compare il formato atteso per la lingua scelta: per l'italiano sono 11 cifre.
2. **Accesso amministratore**: *Email Amministratore* e *Password Master*, di almeno 6 caratteri. L'icona a forma di occhio mostra o nasconde la password.

Seleziona **Resta connesso** se vuoi entrare automaticamente ai prossimi avvii, poi premi **Inizializza Database**. Se un campo manca o il codice fiscale non rispetta il formato, compare un avviso e non viene creato nulla. Al termine entri direttamente nell'applicazione.

### Accesso
Agli avvii successivi vedi **Seleziona Associazione** con le associazioni già usate su questo computer. Puoi selezionarle con il mouse oppure con la tastiera (Tab, poi Invio).

- Scegli l'associazione, inserisci la password e premi **Accedi**.
- **Resta connesso** salva l'accesso: all'avvio successivo entri senza password.
- **Aggiungi un'altra associazione** apre di nuovo il modulo di configurazione.
- L'icona del cestino toglie l'associazione dall'elenco di questo computer, dopo una conferma. I dati nel database non vengono cancellati.
- In alto a destra c'è il selettore della lingua: IT, EN, ES, DE, FR.

All'avvio AssociaGo controlla le associazioni in elenco e toglie quelle che non esistono più nel database in uso, per esempio dopo il passaggio a un altro database.

### Recupero password
Premi **Password dimenticata?** nella schermata della password. La procedura si apre da sola anche dopo due password errate.

1. **Queste associazioni sono tue?** Scegli l'associazione e conferma con **Sì**.
2. Inserisci il **codice fiscale dell'associazione**, poi la nuova password due volte (almeno 6 caratteri).
3. **Reimposta password** salva la nuova password ed esegue subito l'accesso.

> Il recupero si basa sul codice fiscale registrato. Chi ha accesso al computer e conosce il codice fiscale può reimpostare la password: proteggi l'account del sistema operativo.

## 1.2 Interfaccia

### Navigazione
La barra laterale raggruppa le sezioni in *Panoramica*, *Persone*, *Attività*, *Amministrazione*, *Governance* e *Supporto*. Il pulsante in basso la comprime, lasciando solo le icone, e la riespande. Sempre in basso trovi la versione dell'applicazione. Chi usa la tastiera può premere Tab all'apertura per attivare **Vai al contenuto**.

### Ricerca funzioni (palette comandi)
Premi **Cerca funzione** nella barra superiore oppure <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> su macOS). Scrivi il nome di una sezione, oppure "Nuovo Socio" per aprire subito il modulo di iscrizione. Usa le frecce per muoverti, Invio per aprire ed Esc per chiudere.

### Tema chiaro e scuro
Il pulsante sole/luna nella barra superiore cambia il tema e lo ricorda. Puoi sceglierlo anche in **Impostazioni › Generale**: lì la scelta va confermata con **Salva Preferenze**.

### Menu associazione
Il cerchio con le iniziali, in alto a destra, mostra nome ed email dell'associazione. Contiene:
- **Impostazioni**;
- **Informazioni App**: versione, licenza AGPLv3, avvertenze e il pulsante **Sostieni Donando**;
- **Esci**, che chiude la sessione. Se avevi scelto *Resta connesso*, quell'accesso automatico viene rimosso.

### Connessione con il motore dati
AssociaGo usa un motore locale che si avvia insieme all'applicazione.
- Se all'avvio il motore non risponde, compare una schermata con **Riprova**.
- Se la connessione si interrompe durante il lavoro, compare l'avviso "Backend non raggiungibile" con **Riprova**. Le letture vengono ripetute, i salvataggi no: prima di ripetere un salvataggio controlla se era già andato a buon fine.

## 1.3 Dashboard

La **Dashboard** è la prima pagina dopo l'accesso.

### Indicatori principali
Tre schede, ciascuna con un collegamento alla propria sezione:
1. **Soci Attivi**: numero di soci con stato *attivo* e numero di nuovi soci nel mese corrente. Lo stato è quello registrato sull'iscrizione: la data di scadenza non viene ricontrollata in automatico.
2. **Saldo Tesoreria**: entrate meno uscite registrate in Finanze, con il totale delle entrate (verde) e delle uscite (rosso) del mese corrente.
3. **Prossimi Eventi**: eventi futuri non annullati, con il nome e la data del prossimo.

### Attività recenti
Mostra le ultime 5 operazioni: nuovi soci, pagamenti, eventi. **Vedi Tutto** ne mostra fino a 20. La freccia accanto a ciascuna riga apre la sezione relativa.

### Azioni rapide
- **Registra Nuovo Socio** apre il modulo di iscrizione.
- **Crea Evento** apre il modulo del nuovo evento.
- **Registra Pagamento** porta in Finanze.

Se i dati non si caricano, compare un messaggio con **Riprova**.

### Manuale
Questo manuale si apre dalla voce **Manuale Utente** della barra laterale e segue la lingua dell'interfaccia.
