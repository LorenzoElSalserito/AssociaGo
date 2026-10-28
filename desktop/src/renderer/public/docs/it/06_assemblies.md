# 6. Gestione Assemblee

Apri **Assemblee** dal gruppo **Governance** del menu laterale. Qui registri le assemblee dei soci, le presenze, le mozioni e scarichi il verbale.

## 6.1 Elenco assemblee

Per ogni assemblea la tabella mostra:
- titolo e tipo;
- data e ora;
- quorum di prima convocazione (in percentuale);
- stato.

**Cerca assemblee...** filtra per titolo. Fai clic su una riga oppure su **Visualizza dettagli** per aprire la scheda; le altre azioni sono **Modifica** ed **Elimina**.

## 6.2 Creare un'assemblea

Premi **Nuova Assemblea** e compila:
- **Titolo** (obbligatorio) e **Descrizione**.
- **Data** (obbligatoria, con l'ora), **Ora Inizio** e **Ora Fine**.
- **Luogo**.
- **Tipo**: Ordinaria o Straordinaria.
- **Stato**: Bozza, Convocata, In Corso, Chiusa o Annullata. Lo stato si cambia a mano, modificando l'assemblea.
- **Presidente** e **Segretario**: testo libero, non collegato all'elenco soci.
- **Quorum Prima Convocazione (%)** e **Quorum Seconda Convocazione (%)**: valori predefiniti 50 e 33.
- **Note**.

Premi **Crea** (o **Aggiorna** in modifica).

## 6.3 Scheda dettaglio

In alto trovi i pulsanti **Verbale** e **Modifica** e quattro indicatori:
- **Stato**;
- **Presente**: partecipanti registrati come presenti;
- **Delega**: partecipanti registrati per delega;
- **Quorum**: **Raggiunto** o **Non Raggiunto**.

Il quorum si calcola sommando presenti e deleghe e confrontandolo con il numero di soci attivi. È raggiunto se la percentuale arriva alla soglia di prima convocazione oppure a quella di seconda: in pratica basta la soglia più bassa.

Sotto ci sono tre schede.

### Partecipanti
Premi **Registra Presenza** e indica:
- **Seleziona Socio** (obbligatorio);
- **Tipo di Partecipazione**: Presente, Delega o Assente;
- **Ruolo**: Socio, Presidente, Segretario o Scrutatore;
- **Delegato**: compare solo con il tipo Delega; scegli il socio che riceve la delega;
- **Note**.

L'orario di registrazione viene salvato automaticamente. La tabella mostra nome del socio, tipo di partecipazione, ruolo e delegato. Con **Modifica** (icona matita) cambi socio, tipo, ruolo, delegato e note; con **Elimina** rimuovi la registrazione.

> Presenti e deleghe determinano il quorum e il numero massimo di voti registrabili su ogni mozione: aggiorna le presenze prima di registrare i voti.

### Mozioni
Premi **Aggiungi Mozione** e compila:
- **Titolo** (obbligatorio) e **Descrizione**;
- **Tipo di Voto**: Maggioranza Semplice, Maggioranza Qualificata, Unanimità o Consultivo;
- **Numero d'Ordine**;
- **Pianificato (all'ordine del giorno)**;
- **Note**.

Premi **Salva Mozione**. La tabella, ordinata per numero d'ordine, mostra tipo di voto, voti ed **Esito**. Le azioni sono **Registra voto**, **Modifica** (tutti i campi della mozione) ed **Elimina**.

**Registra voto** apre una finestra con **Favorevoli**, **Contrari** e **Astenuti**. Mentre scrivi vedi i voti espressi rispetto agli aventi diritto (presenti + deleghe) e l'esito calcolato. I numeri devono essere interi non negativi e il totale non può superare presenti più deleghe; senza presenti o deleghe il voto non si registra. Premi **Salva voto**; **Annulla voto** riporta la mozione a **Da votare**.

L'esito è calcolato dal programma in base al tipo di voto:
- **Maggioranza Semplice**: approvata se i favorevoli superano i contrari (in parità è respinta);
- **Maggioranza Qualificata**: approvata con almeno 2/3 di favorevoli sui voti espressi, astenuti inclusi;
- **Unanimità**: approvata se non ci sono contrari e c'è almeno un favorevole;
- **Consultivo**: nessun esito vincolante, la mozione risulta **Presa d'atto**.

Se modifichi il tipo di voto di una mozione già votata, l'esito viene ricalcolato con i voti registrati.

### Documenti
Premi **Aggiungi Documento** e indica **Nome Documento** (obbligatorio), **Tipo Documento** (Verbale, Avviso di Convocazione, Allegato, Bilancio), **Descrizione** e **Documento Obbligatorio**.

> Il campo **File** è disattivato: il caricamento dei file non è ancora disponibile, quindi viene registrato solo il nome del documento.

## 6.4 Verbale

**Verbale** scarica un PDF A4, nella lingua dell'interfaccia, con:
- titolo, tipo, data, luogo, presidente e segretario dell'assemblea;
- quorum di prima e seconda convocazione e se è stato raggiunto;
- nomi dei presenti e dei partecipanti per delega, con chi ha ricevuto la delega;
- per ogni mozione, in ordine: tipo di votazione, voti favorevoli, contrari e astenuti, esito (Approvata, Respinta, Presa d'atto o In attesa di voto) ed eventuale delibera;
- le firme di presidente e segretario.

Le mozioni lunghe proseguono sulle pagine successive. Per le firme vale quanto descritto al capitolo 16: l'immagine da **Impostazioni › Firme** compare solo se il nome indicato nell'assemblea coincide con quello della firma salvata; altrimenti resta la riga vuota per firmare a mano.
