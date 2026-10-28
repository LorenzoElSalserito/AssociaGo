# 2. Gestione Soci

La sezione **Soci** contiene l'anagrafica delle persone iscritte all'associazione e le loro iscrizioni.

## 2.1 Elenco soci

La tabella mostra nome, email, ruolo, scadenza e stato di ciascun socio.
- **Cerca soci...** filtra per nome, cognome o email.
- Le azioni di ogni riga sono **Modifica**, **Rinnova Iscrizione** ed **Elimina**.
- Nelle associazioni di tipo **ASD** compare anche lo stato del certificato medico sportivo. In cima all'elenco un avviso segnala i certificati scaduti e quelli che scadono entro 30 giorni.

## 2.2 Nuovo socio e modifica

Premi **Aggiungi Socio**, oppure usa *Registra Nuovo Socio* dalla Dashboard o "Nuovo Socio" dalla ricerca funzioni (<kbd>Ctrl</kbd>+<kbd>K</kbd>).

### Dati anagrafici
- **Nome**, **Cognome**, **Data di nascita** e **Sesso** sono obbligatori.
- **Codice Catastale** è il codice del comune di nascita (es. H501 per Roma).
- **Codice Fiscale** è obbligatorio. Il pulsante **Calcola** lo ricava da nome, cognome, data di nascita, sesso e codice catastale.
- Contatti: **Email**, **Telefono**, **Indirizzo**, **Città**, **CAP**.

### Iscrizione
- **Numero Tessera**: campo libero.
- **Data di Registrazione (arrivo del pagamento)**: obbligatoria, non può essere nel futuro. Vale anche come data del pagamento.
- **Tipologia / Cariche**: puoi spuntarne più di una (Socio Ordinario, Socio Fondatore, Socio Onorario, Presidente, Vice Presidente, Segretario, Tesoriere, Consigliere).

### Quota associativa
Solo per un nuovo socio, **Registra Pagamento Quota Associativa** crea anche l'entrata in Finanze:
- importo proposto 20,00 €, modificabile;
- metodo a scelta tra Contanti, Bonifico, POS / Carta e PayPal.

In modifica la casella non è disponibile: i pagamenti successivi si registrano in Finanze. Il formato tessera e la quota base delle Impostazioni non vengono ancora applicati automaticamente in questo modulo.

### Certificato medico sportivo (solo ASD)
La sezione **Certificato Medico Sportivo** raccoglie:
- tipo (Agonistico o Non agonistico);
- data di rilascio e di scadenza;
- medico certificatore, struttura e note.

## 2.3 Rinnovo ed eliminazione

- **Rinnova Iscrizione** chiede conferma e sposta la scadenza a **un anno da oggi**. Il rinnovo non registra pagamenti: la quota va registrata in Finanze.
- **Elimina** chiede conferma e rimuove l'iscrizione del socio da questa associazione.

## 2.4 Import ed export CSV/JSON

Premi **Importa CSV** per aprire il pannello **Import/export soci**. Per chiuderlo usa **Nascondi Importazione CSV**.

1. **Esempio CSV** / **Esempio JSON** scaricano un file di esempio con le colonne previste.
2. **Esporta CSV** / **Esporta JSON** scaricano tutti i soci attuali.
3. Scegli un file CSV o JSON e premi **Genera Anteprima**. Il riepilogo indica righe totali, valide, duplicate ed errori.
4. **Conferma Importazione** importa tutte le righe valide in un'unica operazione.

Regole:
- se una riga non è valida, l'importazione viene bloccata e nessun dato viene scritto;
- i soci già presenti vengono saltati, senza sovrascrivere dati;
- limite di 5000 righe e 5 MB per file;
- nell'export CSV le celle che iniziano con `=`, `+`, `-` o `@` sono protette, così i fogli di calcolo non le eseguono come formule.

> La tessera stampabile non è ancora disponibile dall'interfaccia.
