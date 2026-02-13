# 2. Gestione Soci (Members)

La sezione **Soci** è il cuore pulsante di AssociaGo. Qui puoi gestire l'anagrafica completa di tutti gli iscritti.

## 2.1 Lista Soci
La tabella principale mostra:
- **Nome e Cognome**
- **Email**
- **Stato**: (Attivo, Scaduto, Sospeso)
- **Scadenza Tessera**: Data di fine validità dell'iscrizione.
- **Ruolo**: (Socio, Presidente, Segretario, ecc.)

### Filtri e Ricerca
Utilizza la barra di ricerca in alto per trovare rapidamente un socio digitando nome, cognome o numero di tessera.

## 2.2 Aggiungere un Nuovo Socio
Cliccando su **"Aggiungi Socio"**, si apre un modulo dettagliato diviso in sezioni:

### Dati Anagrafici
- **Nome e Cognome**: Obbligatori.
- **Data di Nascita**: Fondamentale per il calcolo del Codice Fiscale.
- **Sesso**: Maschio/Femmina.
- **Luogo di Nascita**: Comune o Stato estero.
- **Codice Catastale**: (es. H501 per Roma). Necessario per il calcolo automatico del CF.

### Codice Fiscale
Il sistema include un **calcolatore automatico**. Inserendo i dati anagrafici e cliccando su "Calcola", il campo verrà compilato automaticamente. È sempre possibile modificarlo manualmente.

### Contatti e Indirizzo
- **Email e Telefono**: Per le comunicazioni.
- **Indirizzo Completo**: Via, Città, CAP.

### Dati Associativi
- **Numero Tessera**: Assegnato manualmente o automaticamente se configurato.
- **Ruolo**: Definisce i permessi e la carica sociale.
- **Data Iscrizione**: Data di ingresso nell'associazione.

### Registrazione Pagamento Contestuale
In fondo al modulo, è presente l'opzione **"Registra Pagamento Quota Associativa"**.
Se selezionata:
1.  Si attivano i campi per l'importo (default configurabile) e il metodo di pagamento.
2.  Al salvataggio, il sistema crea **automatiquement** una transazione in entrata nella contabilità, collegata al nuovo socio.

## 2.3 Azioni sul Socio
Per ogni riga della tabella, sono disponibili tre azioni rapide:
1.  **Rinnova (Icona Ricarica)**: Estende la validità della tessera di un anno (o del periodo configurato) e aggiorna lo stato ad "Attivo".
2.  **Modifica (Icona Matita)**: Apre il modulo per aggiornare i dati.
3.  **Elimina (Icona Cestino)**: Rimuove il socio (azione irreversibile, ma mantenuta nei log).

## 2.4 Stampa Tessera
Dalla lista o dal dettaglio, è possibile scaricare il **PDF della Tessera Associativa**, pronto per la stampa, completo di logo dell'associazione e dati del socio.
