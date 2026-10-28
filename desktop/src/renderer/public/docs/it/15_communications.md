# 15. Comunicazioni

La pagina **Comunicazioni** (barra laterale, gruppo **Governance**) serve a preparare e inviare email ai soci. Ha due schede: **Messaggi** e **Modelli**; accanto a ciascuna un contatore indica quanti elementi contiene.

## 15.1 Modelli

Nella scheda **Modelli** premi **Nuovo Modello** e compila:
- **Nome** (obbligatorio, senza il pulsante **Crea** resta disattivato);
- **Oggetto**;
- **Corpo (HTML)**: il testo del messaggio. Puoi usare i segnaposto `{{name}}` (nome e cognome del destinatario) e `{{associationName}}` (nome dell'associazione).

La tabella mostra **Nome Modello** e **Oggetto**. Le azioni di ogni riga sono modifica (matita, poi **Salva**) ed eliminazione (cestino, con conferma).

## 15.2 Creare un messaggio

Nella scheda **Messaggi** premi **Nuovo Messaggio**.
- **Applica Modello**: compare solo se esiste almeno un modello e solo per i nuovi messaggi. Copia oggetto e corpo del modello nel messaggio.
- **Oggetto** (obbligatorio).
- **Nome Mittente** ed **Email Mittente**. L'email diventa il mittente del messaggio; se la lasci vuota si usa `noreply@associago.local`. Il nome mittente viene salvato ma non compare nell'email.
- **Filtro Segmento**: campo di testo libero. Se contiene la parola `active` il messaggio va solo ai soci con iscrizione attiva; qualsiasi altro testo, o il campo vuoto, vuol dire tutti i soci dell'associazione con un indirizzo email.
- **Corpo Messaggio (HTML)**, con gli stessi segnaposto dei modelli.

Premi **Crea**. Il messaggio nasce in stato **Bozza**.

La tabella dei messaggi mostra **Oggetto**, **Stato**, numero di **Destinatari** e **Data** di creazione. Solo le bozze si possono modificare (matita); il cestino elimina il messaggio dopo una conferma.

## 15.3 Destinatari e invio

Fai clic su un messaggio per aprirne il dettaglio. Per una bozza:
1. premi **Risolvi Destinatari**: l'app calcola l'elenco dai soci dell'associazione, in base al Filtro Segmento, e mostra quanti destinatari ha trovato. Ogni indirizzo email compare una sola volta; se premi di nuovo, l'elenco viene ricalcolato da zero;
2. premi **Invia** (attivo solo dopo aver risolto i destinatari) e conferma.

L'email parte come testo semplice: il contenuto scritto nell'editor viene convertito mantenendo paragrafi e a capo, senza formattazione. Prima di una comunicazione importante prova un invio verso un tuo indirizzo.

## 15.4 Dettaglio e statistiche

In alto quattro riquadri: **Destinatari Totali**, **Consegnati**, **Non riusciti** e **Inviato il**. Sotto trovi il **Contenuto Messaggio** e la tabella **Destinatari** con nome, email, stato (In attesa, Inviato o Fallito) e ora d'invio.

"Consegnati" vuol dire che il server di posta ha accettato l'email, non che sia arrivata nella casella del socio.

A invio terminato il messaggio passa a **Inviato**; se nessuna email è stata accettata dal server passa a **Fallito**. In caso di invii parziali controlla il riquadro **Non riusciti** e la colonna stato dei destinatari.

## 15.5 Configurare il server di posta

Nell'app non c'è una schermata per il server email: va configurato dall'amministratore impostando queste variabili d'ambiente prima di avviare AssociaGo.

| Variabile | A cosa serve | Valore se assente |
|---|---|---|
| `SMTP_HOST` | indirizzo del server di posta in uscita | `localhost` |
| `SMTP_PORT` | porta del server (di solito 587 oppure 25) | `25` |
| `SMTP_USER` | nome utente della casella | vuoto |
| `SMTP_PASSWORD` | password della casella | vuota |
| `SMTP_AUTH` | `true` se il server chiede utente e password | `false` |
| `SMTP_TLS` | `true` per usare la connessione cifrata STARTTLS | `false` |

Senza queste impostazioni l'app cerca un server di posta sul computer stesso: quasi sempre non c'è, quindi tutte le email finiscono tra i **Non riusciti**.
