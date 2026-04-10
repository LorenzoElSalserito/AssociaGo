# 15. Comunicazioni

La sezione **Comunicazioni** permette di inviare email istituzionali ai soci, gestire modelli predefiniti e tracciare lo stato di consegna.

## 15.1 Panoramica
La pagina è divisa in due schede:
- **Messaggi**: L'elenco delle comunicazioni create e inviate.
- **Modelli**: I template riutilizzabili per velocizzare la creazione dei messaggi.

## 15.2 Gestione Modelli

### Creare un Modello
1. Dalla scheda **Modelli**, clicca **"Nuovo Modello"**.
2. Compila:
   - **Nome**: Nome identificativo (es. "Convocazione Assemblea").
   - **Oggetto**: L'oggetto dell'email.
   - **Corpo HTML**: Il testo del messaggio.
   - **Corpo Testo**: Versione solo testo (per client email che non supportano HTML).
   - **Categoria**: Generale, Rinnovo, Evento, Attività, Assemblea, Fiscale.
3. Utilizza i **campi di unione** nel testo:
   - `{{name}}` — Nome completo del destinatario.
   - `{{associationName}}` — Nome dell'associazione.
4. Clicca **"Salva"**.

### Applicare un Modello
Quando si crea un nuovo messaggio, è possibile selezionare un modello dal menu a tendina. L'oggetto e il corpo verranno precompilati con i dati del template.

## 15.3 Creazione e Invio Messaggi

### Creare un Messaggio
1. Dalla scheda **Messaggi**, clicca **"Nuovo Messaggio"**.
2. Compila:
   - **Oggetto**: L'oggetto dell'email.
   - **Corpo**: Il contenuto del messaggio.
   - **Filtro destinatari**: Filtra i soci per stato (es. solo Attivi).
3. Clicca **"Salva come Bozza"** o procedi all'invio.

### Risolvere i Destinatari
Prima dell'invio, clicca **"Risolvi Destinatari"** per:
- Visualizzare l'elenco completo dei soci che riceveranno il messaggio.
- Verificare gli indirizzi email.
- Controllare il numero totale di destinatari.

### Inviare
1. Clicca **"Invia"**.
2. Il sistema invia le email tramite il server SMTP configurato nelle impostazioni.
3. Lo stato passa da **Bozza** a **In invio** e poi a **Inviato**.

## 15.4 Statistiche di Consegna
Per ogni messaggio inviato, la vista di dettaglio mostra:
- **Totale destinatari**: Numero di email inviate.
- **Consegnate**: Email recapitate con successo.
- **Fallite**: Email non consegnate (con dettaglio errore).
- **Data di invio**: Timestamp dell'invio.

## 15.5 Stati dei Messaggi
| Stato | Significato |
|-------|-------------|
| Bozza | Messaggio salvato ma non ancora inviato. |
| In invio | Invio in corso. |
| Inviato | Tutti i messaggi sono stati processati. |
| Fallito | L'invio ha riscontrato errori. |

> **Nota**: Per utilizzare le comunicazioni email, è necessario configurare un server SMTP nelle impostazioni dell'applicazione (variabili d'ambiente SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
