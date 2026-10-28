# 11. Attestati e Certificati

La pagina **Attestati** ha due schede: **Modelli** ed **Emessi**. In alto trovi i pulsanti **Nuovo Modello** ed **Emetti Certificato**.

## 11.1 Modelli

La tabella mostra per ogni modello nome, tipo, impaginazione (orientamento / formato) e stato **Attivo** o **Inattivo**. Le azioni sono l'icona **matita** (modifica) e l'icona **cestino** (elimina, dopo la conferma **Sei sicuro?**).

> Se il modello è già stato usato per emettere attestati, l'eliminazione non riesce e compare un messaggio di errore del database. Non c'è un avviso dedicato.

## 11.2 Creare un modello

Premi **Nuovo Modello**. A sinistra ci sono quattro schede, a destra l'**Anteprima**.

### Generale
- **Nome** (obbligatorio: senza nome **Crea** resta disattivato). Diventa anche il titolo dell'attestato.
- **Tipo**: Partecipazione, Presenze, Formazione, Iscrizione o Personalizzato.
- **Attivo**: interruttore.

> Lo stato **Attivo** è solo informativo: anche i modelli inattivi compaiono nell'emissione e si possono usare.

### Corpo
Scrivi il testo in **Corpo del Modello**. I pulsanti sopra il campo inseriscono un campo dinamico nella posizione del cursore:

| Campo | Viene sostituito con |
|-------|----------------------|
| `{{firstName}}`, `{{lastName}}` | nome e cognome del destinatario |
| `{{fiscalCode}}` | codice fiscale del destinatario |
| `{{associationName}}` | nome dell'associazione |
| `{{date}}` | data di emissione |
| `{{activityName}}`, `{{activityCategory}}` | nome e categoria dell'attività (solo emissione per attività) |
| `{{eventName}}`, `{{eventType}}` | nome e tipo dell'evento, come codice interno (solo emissione per evento) |

I campi di attività ed evento restano come testo letterale se l'attestato non è emesso da un'attività o da un evento. Nel PDF il corpo diventa testo semplice: eventuali tag HTML vengono rimossi.

### Impaginazione
- **Orientamento**: **Orizzontale** o **Verticale**.
- **Formato Carta**: A4, A3 o Letter.

> Il formato carta viene salvato ma non usato: il PDF è sempre A4, nell'orientamento scelto.

### Firmatari
Spunta i **Ruoli Firmatari**: Presidente (preselezionato), Segretario, Tesoriere. Nel PDF ogni ruolo ha un blocco firma con l'immagine, il nome e la carica presi da **Impostazioni › Firme** (capitolo 16); se per un ruolo non c'è una firma salvata, compare il nome dell'**Organigramma** (**Impostazioni › Profilo Associazione**) sopra una riga vuota.

### Anteprima
Mostra il titolo, il corpo con dati di esempio (es. "Mario Rossi") e una linea di firma per ogni ruolo spuntato. Segue l'orientamento scelto.

Premi **Crea** (o **Salva** in modifica).

## 11.3 Emettere attestati

Premi **Emetti Certificato** e scegli il **Modello**.

### A un socio
1. In **Socio** scegli un nominativo dall'elenco dei soci dell'associazione.
2. Premi **Emetti**.

### A tutti i partecipanti
Sotto **O emetti in blocco per tutti i partecipanti:**
- scegli un'**Attività** e premi **Emissione Multipla per Attività**: ricevono l'attestato i partecipanti attivi iscritti come soci;
- oppure scegli un **Evento** e premi **Emissione Multipla per Evento**: ricevono l'attestato i partecipanti registrati come soci; gli ospiti vengono saltati.

I pulsanti compaiono solo dopo aver scelto modello e attività o evento. Puoi emettere in blocco anche dalla scheda **Attestati** di un'attività (capitolo 3).

> Non c'è controllo sui doppioni: ripetendo l'emissione, ogni destinatario riceve un nuovo attestato.

Ogni attestato riceve un numero progressivo nel formato **CERT-ANNO-NNNN**. Il testo e il titolo vengono congelati al momento dell'emissione: modificare il modello dopo non cambia gli attestati già emessi. Le firme invece vengono lette a ogni download, secondo i ruoli del modello.

## 11.4 Attestati emessi e PDF

La scheda **Emessi** (con il contatore) elenca **Certificato** (numero), **Destinatario** (nome del socio) ed **Emesso il**. L'icona di **download** scarica il PDF (A4, con numero e data nella lingua dell'interfaccia), che contiene:
- titolo (nome del modello), numero e data di emissione;
- corpo con i dati compilati;
- un blocco firma per ogni ruolo firmatario (immagine, nome e carica);
- un codice QR in basso a destra con numero, associazione e data.

> A ogni download viene calcolato e salvato un checksum SHA-256 del PDF, ma non viene stampato sul documento né mostrato nell'interfaccia.
