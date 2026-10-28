# 7. Gestione Inventario

Apri **Inventario** dal gruppo **Attività** del menu laterale. Qui registri i beni e le attrezzature dell'associazione e i prestiti ai soci.

## 7.1 Elenco oggetti

Per ogni oggetto la tabella mostra:
- nome e codice inventario;
- categoria;
- quantità;
- stato.

**Cerca oggetti...** filtra per nome. Fai clic su una riga oppure su **Visualizza dettagli** per aprire la scheda; le altre azioni sono **Modifica** ed **Elimina**.

## 7.2 Aggiungere un oggetto

Premi **Aggiungi Oggetto** e compila:
- **Nome Oggetto** (obbligatorio) e **Codice Inventario** (es. INV-001).
- **Descrizione**.
- **Categoria**: testo libero, scegli tu le categorie.
- **Quantità** e **Luogo**.
- **Metodo Acquisizione**: Acquisto, Donazione, Prestito o Sconosciuto.
- **Assegnato a (ID Utente)**: facoltativo, si inserisce il numero identificativo, non il nome.
- **Valore Attuale** e **Anni di Ammortamento**, facoltativi.
- **Condizione**: Nuovo, Buono, Discreto, Scarso o Rotto.
- **Stato**: Disponibile, In Uso, In Prestito, Perso o Dismesso.
- **Note**.

Condizione e stato sono indipendenti: la prima descrive lo stato fisico, il secondo dove si trova o come è usato l'oggetto.

### Acquisto
Con **Acquisto** compaiono **Prezzo d'Acquisto** e **Data Acquisto**. Alla creazione, se il prezzo è maggiore di zero, AssociaGo registra automaticamente un'uscita in Finanze con quell'importo e la data d'acquisto (oppure la data di oggi).

> L'uscita si crea solo quando aggiungi l'oggetto: se poi modifichi il prezzo, la transazione non viene aggiornata.

### Valore e ammortamento
Il valore attuale viene ricalcolato dal prezzo d'acquisto: se sono presenti prezzo, data d'acquisto e anni di ammortamento, si sottrae una quota fissa per ogni anno trascorso fino ad arrivare a zero; altrimenti coincide con il prezzo d'acquisto.

> Il valore inserito a mano in **Valore Attuale** non viene mantenuto: al momento della lettura è sostituito dal valore calcolato.

Premi **Crea** (o **Aggiorna** in modifica).

## 7.3 Scheda dettaglio

In alto trovi il pulsante **Modifica** e tre indicatori: **Quantità**, **Condizione** e **Stato**. Sotto il nome compaiono categoria e luogo.

### Storico Prestiti
Premi **Registra Prestito** e indica:
- **Seleziona Socio** (obbligatorio);
- **Data Prestito** e **Data Restituzione Prevista**;
- **Condizione al Prestito**: Nuovo, Buono, Discreto, Scarso o Rotto;
- **Note**.

La tabella mostra **ID Socio**, **Data Prestito**, **Data Restituzione** (o la data prevista seguita da "(Exp)" finché l'oggetto non torna) e stato. Sui prestiti in corso premi **Restituisci** e conferma: viene registrata la data di oggi.

> Registrare o chiudere un prestito non cambia lo stato né la quantità dell'oggetto: aggiornali a mano con **Modifica**. La condizione al rientro non si registra.
