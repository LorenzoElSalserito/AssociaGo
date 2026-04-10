# 17. Benachrichtigungen

Das **Benachrichtigungssystem** von AssociaGo informiert in Echtzeit über wichtige Ereignisse des Vereins.

## 17.1 Benachrichtigungsglocke
In der Kopfzeile der Seite befindet sich neben dem Benutzerprofil das **Glockensymbol**:
- Ein **rotes Badge** mit einer Zahl zeigt die ungelesenen Benachrichtigungen an.
- Durch Klicken auf die Glocke öffnet sich das Benachrichtigungsfeld.

## 17.2 Benachrichtigungsfeld
Das Feld zeigt die Liste der Benachrichtigungen sortiert nach Aktualität:

Für jede Benachrichtigung werden angezeigt:
- **Titel**: Kurzbeschreibung des Ereignisses.
- **Nachricht**: Zusätzliche Details.
- **Datum und Uhrzeit**: Wann die Benachrichtigung erstellt wurde.
- **Status**: Gelesen (grau) oder Ungelesen (hervorgehoben).

### Verfügbare Aktionen
- **Als gelesen markieren**: Klicken Sie auf eine einzelne Benachrichtigung, um sie als gelesen zu markieren.
- **Alle als gelesen markieren**: Schaltfläche oben im Feld, um alle Benachrichtigungen mit einer einzigen Aktion als gelesen zu markieren.

## 17.3 Benachrichtigungstypen
Das System erzeugt automatische Benachrichtigungen für verschiedene Ereignisse:

| Typ | Beschreibung |
|-----|-------------|
| **INFO** | Allgemeine Informationen (z. B. "Neues Mitglied registriert"). |
| **WARNING** | Hinweise, die Aufmerksamkeit erfordern (z. B. "Mitgliedsausweise laufen ab"). |
| **ALERT** | Dringende Situationen (z. B. "Bevorstehende steuerliche Frist"). |
| **REMINDER** | Geplante Erinnerungen (z. B. "Versammlung morgen"). |

## 17.4 Automatische Aktualisierung
Die Benachrichtigungen werden automatisch alle **30 Sekunden** aktualisiert, ohne dass die Seite neu geladen werden muss. Das Badge auf der Glocke wird in Echtzeit aktualisiert.

## 17.5 Verknüpfte Benachrichtigungen
Einige Benachrichtigungen sind mit bestimmten Entitäten verknüpft (Mitglied, Veranstaltung, Aktivität). Das System erfasst den Typ und die ID der zugehörigen Entität, um die direkte Navigation zum Kontext der Benachrichtigung zu erleichtern.

> **Hinweis**: Benachrichtigungen werden vom System automatisch als Reaktion auf Aktionen und Fristen erzeugt. Es ist derzeit nicht möglich, manuelle Benachrichtigungen zu erstellen.
