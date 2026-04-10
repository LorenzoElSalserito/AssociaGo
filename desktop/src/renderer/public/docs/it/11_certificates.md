# 11. Attestati e Certificati

La sezione **Attestati** consente di creare modelli personalizzabili e di emettere certificati per soci, partecipanti ad attività e partecipanti ad eventi.

## 11.1 Panoramica

La pagina è divisa in due schede principali:
- **Modelli**: I template da cui vengono generati gli attestati.
- **Emessi**: L'elenco di tutti gli attestati già generati, con la possibilità di scaricarli in PDF.

## 11.2 Gestione Modelli

### Creare un Nuovo Modello
Clicca su **"Nuovo Modello"** per aprire la modale di creazione. La modale è organizzata in quattro sezioni:

#### Generale
- **Nome**: Il nome identificativo del modello (es. "Attestato di Partecipazione Corso Base").
- **Tipo**: Seleziona la tipologia tra:
  - *Partecipazione* — per chi ha partecipato a un'attività o evento.
  - *Frequenza* — per chi ha completato un percorso con presenza minima.
  - *Formazione* — per corsi formativi con certificazione.
  - *Iscrizione* — attestato di appartenenza all'associazione.
  - *Personalizzato* — formato libero per esigenze specifiche.
- **Attivo**: Switch per abilitare/disabilitare il modello. Solo i modelli attivi possono essere usati per l'emissione.

#### Corpo
Qui si scrive il testo dell'attestato. Una riga di **pulsanti per i campi dinamici** permette di inserire segnaposto che verranno sostituiti automaticamente con i dati reali:

| Campo | Descrizione |
|-------|-------------|
| `{{firstName}}` | Nome del socio |
| `{{lastName}}` | Cognome del socio |
| `{{fiscalCode}}` | Codice fiscale |
| `{{associationName}}` | Nome dell'associazione |
| `{{date}}` | Data di emissione |
| `{{activityName}}` | Nome dell'attività collegata |
| `{{activityCategory}}` | Categoria dell'attività |
| `{{eventName}}` | Nome dell'evento collegato |
| `{{eventType}}` | Tipologia dell'evento |

Clicca su un pulsante per inserire il campo nella posizione corrente del cursore nel testo.

#### Impaginazione
- **Orientamento**: Orizzontale (landscape) o Verticale (portrait).
- **Formato Carta**: A4, A3 o Letter.

#### Firmatari
Seleziona quali cariche istituzionali devono firmare l'attestato:
- Presidente
- Segretario
- Tesoriere

Le firme verranno posizionate in fondo al certificato PDF generato, prelevando automaticamente le immagini delle firme configurate nella sezione Impostazioni > Firme.

### Anteprima in Tempo Reale
Sul lato destro della modale, un **pannello di anteprima** mostra come apparirà l'attestato. I campi dinamici vengono sostituiti con dati di esempio (es. "Mario Rossi") per dare un'idea del risultato finale. L'anteprima riflette anche l'orientamento e lo stato attivo/inattivo.

### Modificare un Modello
Clicca sull'icona **matita** nella riga del modello per aprire la modale con tutti i dati precompilati.

### Eliminare un Modello
Clicca sull'icona **cestino**. Verrà chiesta conferma prima della cancellazione. I modelli con attestati già emessi non possono essere eliminati.

## 11.3 Emissione Attestati

### Emissione Singola
1. Clicca **"Emetti Certificato"**.
2. Seleziona il **modello** dal menu a tendina.
3. Inserisci l'**ID del socio** destinatario.
4. Clicca **"Emetti"**.

Il sistema genera un attestato con numero univoco (formato: CERT-ANNO-NNNN) e lo associa al socio.

### Emissione in Blocco (Batch)
Per emettere attestati a tutti i partecipanti di un'attività o evento:
1. Seleziona il modello.
2. Nella sezione inferiore, scegli un'**attività** o un **evento** dal menu a tendina.
3. Clicca **"Emissione batch per Attività"** o **"Emissione batch per Evento"**.

Tutti i partecipanti attivi riceveranno un attestato.

## 11.4 Download PDF
Nella scheda **Emessi**, ogni attestato ha un pulsante di **download**. Il PDF generato include:
- Titolo e corpo dell'attestato con i dati compilati.
- Numero univoco del certificato.
- Data di emissione.
- Firme istituzionali.
- Checksum SHA-256 per la verifica di autenticità.
