# 17. Notifiche

Il sistema di **Notifiche** di AssociaGo informa in tempo reale sugli eventi importanti dell'associazione.

## 17.1 Campanella delle Notifiche
Nell'intestazione della pagina, accanto al profilo utente, è presente l'icona della **campanella**:
- Un **badge rosso** con il numero indica le notifiche non lette.
- Cliccando sulla campanella si apre il pannello delle notifiche.

## 17.2 Pannello Notifiche
Il pannello mostra l'elenco delle notifiche ordinate dalla più recente:

Per ogni notifica vengono visualizzati:
- **Titolo**: Descrizione breve dell'evento.
- **Messaggio**: Dettaglio aggiuntivo.
- **Data e Ora**: Quando è stata generata la notifica.
- **Stato**: Letta (grigia) o Non letta (evidenziata).

### Azioni Disponibili
- **Segna come letta**: Clicca sulla singola notifica per segnarla come letta.
- **Segna tutte come lette**: Pulsante in alto nel pannello per segnare tutte le notifiche come lette in un'unica azione.

## 17.3 Tipi di Notifica
Il sistema genera notifiche automatiche per diversi eventi:

| Tipo | Descrizione |
|------|-------------|
| **INFO** | Informazioni generali (es. "Nuovo socio registrato"). |
| **WARNING** | Avvisi che richiedono attenzione (es. "Tessere in scadenza"). |
| **ALERT** | Situazioni urgenti (es. "Scadenza fiscale imminente"). |
| **REMINDER** | Promemoria programmati (es. "Assemblea domani"). |

## 17.4 Aggiornamento Automatico
Le notifiche vengono aggiornate automaticamente ogni **30 secondi** senza necessità di ricaricare la pagina. Il badge sulla campanella si aggiorna in tempo reale.

## 17.5 Notifiche Collegate
Alcune notifiche sono collegate a entità specifiche (socio, evento, attività). Il sistema registra il tipo e l'ID dell'entità correlata per facilitare la navigazione diretta al contesto della notifica.

> **Nota**: Le notifiche vengono generate automaticamente dal sistema in risposta ad azioni e scadenze. Non è attualmente possibile creare notifiche manuali.
