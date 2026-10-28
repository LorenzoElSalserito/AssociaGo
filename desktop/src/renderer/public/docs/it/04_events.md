# 4. Gestione Eventi

La pagina **Eventi e Coupon** contiene due schede: **Eventi** (feste, riunioni, raccolte fondi, conferenze) e **Coupon** (vedi capitolo 9).

## 4.1 Elenco eventi

La tabella mostra per ogni evento:
- titolo;
- data;
- luogo;
- stato.

**Cerca eventi...** filtra l'elenco. In ogni riga ci sono le azioni **Visualizza dettagli**, **Modifica** ed **Elimina**.

## 4.2 Creare un evento

Premi **Aggiungi Evento** e compila:
- **Nome Evento** e **Tipo**, entrambi obbligatori. I tipi sono Riunione / Assemblea, Festa, Raccolta Fondi, Congresso, Conferenza, Altro.
- **Stato**: Pianificato, Confermato, In Corso, Completato oppure Annullata. Gli eventi annullati non compaiono tra i prossimi eventi della Dashboard.
- **Data Inizio** (obbligatoria), **Ora Inizio**, **Data Fine**, **Ora Fine**.
- **Luogo**, **Indirizzo** e **Descrizione**.
- **Costo Soci** e **Costo Non Soci**.
- **Max Partecipanti**. Se lo lasci vuoto, i posti sono illimitati.
- Le opzioni **Evento Pubblico**, **Richiede Registrazione** e **Genera Fattura**.

## 4.3 Scheda dettaglio

### Indicatori
- **Registrato**: numero di iscritti, esclusi annullati e lista d'attesa.
- **Presente**: numero di partecipanti che hanno fatto il check-in.
- **Tasso di Presenza**: presenti diviso iscritti.
- **Entrate**: somma dei pagamenti registrati; per chi è segnato come Pagato senza importo registrato conta la quota dovuta, già scontata.

### Partecipanti
**Aggiungi Partecipante** propone due **tipi di partecipante**:
- **Socio**: si sceglie dall'elenco dei soci.
- **Ospite (Esterno)**: si indicano nome ed email.

La quota dovuta è il **costo soci** per i soci e il **costo non soci** per gli ospiti. Il campo facoltativo **Codice coupon** applica uno sconto (vedi 9.3); la tabella mostra la quota dovuta e, se usato, il coupon con lo sconto.

Per ogni partecipante la tabella mostra stato, presenza e pagamento, con l'azione di rimozione. Il campo **Cerca partecipante per nome o email** filtra le righe: utile all'ingresso con elenchi lunghi.

In ogni riga:
- **Check-in**: segna il partecipante come presente e registra l'ora di arrivo, mostrata sotto il pulsante. Il pulsante diventa **Presente**; premilo di nuovo per annullare il check-in. Chi ha l'iscrizione annullata non può fare il check-in.
- **Stato pagamento**: dal menu nella riga scegli In attesa, Pagato, Esente o Rimborsato. La modifica è salvata subito.

Dopo ogni azione gli indicatori in alto si aggiornano.

### Attestati
Scegli un modello e premi **Emetti in Blocco**: ogni partecipante iscritto come socio riceve un attestato. Gli ospiti esterni non ricevono attestati nominativi.

### Importazione CSV
Qui importi i partecipanti da un file CSV. Il flusso (anteprima, poi conferma) è lo stesso delle attività: vedi il capitolo 3.
