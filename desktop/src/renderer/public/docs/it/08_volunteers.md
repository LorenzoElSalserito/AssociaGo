# 8. Gestione Volontari

Apri **Volontari** dal gruppo **Persone** del menu laterale. Qui colleghi i soci al ruolo di volontario, registri i turni e gestisci i rimborsi spese.

## 8.1 Elenco volontari

Per ogni volontario la tabella mostra:
- nome ed email del socio;
- competenze;
- ore;
- stato.

**Cerca volontari...** filtra per nome. Le azioni di ogni riga sono **Visualizza dettagli**, **Modifica** ed **Elimina**.

La colonna **Ore** somma le **Ore Lavorate** di tutti i turni del volontario; **Stato** indica Attivo o Inattivo.

## 8.2 Aggiungere un volontario

Premi **Aggiungi Volontario** e compila:
- **Socio** (obbligatorio): scegli il socio da **Seleziona un socio...**;
- **Competenze**: testo libero, es. Primo soccorso, Logistica, Comunicazione;
- **Disponibilità**: testo libero, es. Weekend, Serate;
- **Stato**: Attivo o Inattivo;
- **Note**.

Premi **Crea** (o **Aggiorna** in modifica).

> In modifica il socio collegato non cambia: per associare un altro socio crea un nuovo volontario.

## 8.3 Scheda dettaglio

L'intestazione mostra **Volontario** con il suo numero e l'**ID Socio**, più il pulsante **Modifica**. Tre riquadri riportano **Stato**, **Competenze** e **Disponibilità**. Sotto ci sono due schede.

### Turni
Premi **Aggiungi Turno** e compila:
- **Ora Inizio** e **Ora Fine** (data e ora, obbligatorie);
- **Ruolo**;
- **Evento (Opzionale)** oppure **Attività (Opzionale)**, per collegare il turno;
- **Ore Lavorate** e **Valore Orario (€)**;
- **Stato**: Programmato, Completato o Mancato;
- **Descrizione / Note**.

Premi **Salva Turno**. La tabella mostra inizio, fine, ruolo, ore e stato; l'icona di modifica riapre il turno.

> Le ore lavorate non si calcolano dagli orari: inseriscile tu. Il valore orario viene salvato ma non è usato in nessun riepilogo. In modifica vengono aggiornati solo orari, ruolo, ore e stato; evento, attività, valore orario e note restano quelli iniziali. I turni non si possono eliminare.

### Uscite (rimborsi spese)
Premi **Aggiungi Spesa** e indica **Data**, **Descrizione** e **Importo (€)**, tutti obbligatori, poi **Salva Spesa**. La spesa parte in attesa di approvazione.

Le azioni seguono lo stato della spesa:
- in attesa: **Approva** o **Rifiuta**;
- approvata: **Segna come Pagato**.

Quando segni una spesa come pagata, AssociaGo registra automaticamente un'uscita in Finanze, con la data di oggi e la categoria Reimbursement, intestata all'associazione con cui hai effettuato l'accesso.

> Le spese non si possono modificare né eliminare, e non si allegano ricevute.
