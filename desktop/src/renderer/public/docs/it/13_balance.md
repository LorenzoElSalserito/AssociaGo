# 13. Bilancio Consuntivo

La pagina **Bilancio Annuale** calcola il rendiconto di un anno a partire dai movimenti registrati in contabilità.

## 13.1 Elenco dei bilanci

La tabella mostra **Anno**, **Titolo**, **Stato** e **Risultato Netto** (verde se positivo, rosso se negativo). Clicca una riga per aprire il bilancio. L'icona **cestino** lo elimina, dopo la conferma **Sei sicuro?**.

## 13.2 Calcolare un bilancio

1. Premi **Calcola Bilancio**.
2. Nella finestra **Calcola Bilancio Annuale** indica l'**Anno**.
3. Premi **Calcola**.

Il sistema prende i movimenti dal 1° gennaio al 31 dicembre, li raggruppa per categoria (quelli senza categoria finiscono in "Altre entrate" o "Altre uscite") e crea il bilancio "Bilancio consuntivo ANNO". Titolo e voci generiche sono scritti nella lingua dell'interfaccia al momento del calcolo.

> Se per quell'anno esiste già un bilancio, viene ricalcolato e sovrascritto, anche se era approvato, e torna a uno stato non approvato.

## 13.3 Dettaglio

In alto tre riquadri: **Entrate Totali**, **Uscite Totali** e **Risultato Netto**. Sotto, due tabelle **Entrate** e **Uscite** con una riga per categoria e il totale in grassetto (TOTALE ENTRATE, TOTALE USCITE).

> Il confronto con l'anno precedente viene calcolato ma non è mostrato né nella pagina né nel PDF.

## 13.4 Firmatari

All'apertura il sistema controlla da solo che **Presidente**, **Segretario** e **Tesoriere** abbiano un nome in **Impostazioni › Firme** oppure nell'**Organigramma** (**Impostazioni › Profilo Associazione**). Se ne manca uno compare l'avviso **Firmatari mancanti** seguito dai ruoli in forma di codice inglese (president, secretary, treasurer).

## 13.5 Approvazione

**Approva** porta il bilancio allo stato approvato. Resta disattivato finché manca anche uno solo dei tre firmatari; dopo l'approvazione scompare.

> L'approvazione non rende il bilancio immutabile: si può ancora eliminare o ricalcolare.

## 13.6 PDF

**Scarica PDF** è disponibile in ogni stato, anche prima dell'approvazione, e salva il file `bilancio_ANNO.pdf` in formato A4, nella lingua dell'interfaccia (etichette, date e importi). Contiene:
- nome, indirizzo, città e codice fiscale dell'associazione;
- titolo "BILANCIO CONSUNTIVO ANNO" e periodo;
- entrate e uscite per categoria con i totali;
- "AVANZO DI GESTIONE" o "DISAVANZO DI GESTIONE", fondo iniziale e finale;
- sezione "Firme" per Presidente, Segretario e Tesoriere: immagine della firma da **Impostazioni › Firme** (capitolo 16), nome e carica; senza firma salvata, il nome dall'Organigramma e una riga vuota;
- data e ora di generazione e numero di pagina.

> Il PDF non contiene logo né data di approvazione.

A ogni download viene calcolato un checksum SHA-256 del PDF. Le prime 16 cifre compaiono accanto allo stato dopo aver lasciato e riaperto la pagina.

> **Nota**: il bilancio consuntivo è obbligatorio per gli enti del Terzo Settore e va approvato dall'assemblea nei termini di legge (in genere entro il 30 aprile dell'anno successivo).
