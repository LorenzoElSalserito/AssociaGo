# 9. Coupon e Sconti

I coupon sono codici sconto per attività ed eventi. Li gestisci da tre punti, che mostrano lo stesso elenco:
- la voce **Coupon** nel gruppo **Attività** del menu laterale;
- la scheda **Coupon** della pagina **Attività e Coupon**;
- la scheda **Coupon** della pagina **Eventi e Coupon**.

## 9.1 Elenco coupon

Per ogni coupon la tabella mostra:
- **Codice**;
- **Sconto**: percentuale o importo in euro, con l'importo minimo se impostato;
- **Validità**: data di inizio e di fine (∞ se senza scadenza);
- **Utilizzi**: iscrizioni salvate con il coupon sul massimo consentito (∞ se illimitati);
- **Stato**: **Attivo** o **Inattivo**.

Le azioni di ogni riga sono **Modifica** ed **Elimina**.

## 9.2 Creare un coupon

Premi **Aggiungi Coupon** e compila:
- **Codice Coupon** (obbligatorio), es. ESTATE2026.
- **Descrizione**.
- **Tipo Sconto**: Percentuale o Importo Fisso.
- **Valore Sconto** (obbligatorio).
- **Data Inizio** (di default oggi) e **Data Fine**.
- **Max Utilizzi (0 per illimitato)**.
- **Importo Minimo**.
- **Attività Applicabili** ed **Eventi Applicabili**: selezione multipla. Se scegli almeno un'attività o un evento, il coupon vale solo per quelli scelti; lascia vuote entrambe le liste per renderlo valido ovunque.
- **Attivo**.

Premi **Salva Coupon**.

## 9.3 Utilizzo

Il codice si inserisce nel campo **Codice coupon** del modulo **Aggiungi Partecipante**, sia nelle attività sia negli eventi (soci e ospiti). Le maiuscole non contano. Premi **Applica** per vedere prezzo, sconto e **importo dovuto** prima di salvare.

Il prezzo di partenza è:
- per le attività, il costo dell'attività;
- per gli eventi, il costo soci per i soci e il costo non soci per gli ospiti.

Lo sconto percentuale è arrotondato al centesimo; quello fisso non supera mai il prezzo, quindi l'importo dovuto non scende sotto zero.

Il coupon è rifiutato, con un messaggio, se:
- il codice non esiste nell'associazione;
- non è **Attivo**;
- oggi è prima della **Data Inizio** o dopo la **Data Fine** (la data di fine è inclusa);
- ha raggiunto **Max Utilizzi** (0 = illimitato);
- il prezzo è inferiore all'**Importo Minimo**;
- non vale per l'attività o l'evento scelto (vedi 9.2).

Al salvataggio il programma controlla di nuovo il coupon: se nel frattempo non è più valido, l'iscrizione non viene salvata. Se è valido, sul partecipante restano il coupon, lo sconto e l'importo dovuto, e **Utilizzi** aumenta di 1. Il coupon compare come etichetta nella tabella dei partecipanti e le **Entrate** usano l'importo scontato.

> Rimuovere un partecipante **non** restituisce l'utilizzo: il contatore conta i coupon usati, anche per iscrizioni poi cancellate. Se serve, aumenta **Max Utilizzi** dal modulo di modifica.
