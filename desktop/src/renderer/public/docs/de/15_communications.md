# 15. Kommunikation

Der Bereich **Kommunikation** ermöglicht den Versand offizieller E-Mails an Mitglieder, die Verwaltung vordefinierter Vorlagen und die Nachverfolgung des Zustellstatus.

## 15.1 Überblick
Die Seite ist in zwei Registerkarten unterteilt:
- **Nachrichten**: Die Liste der erstellten und versendeten Mitteilungen.
- **Vorlagen**: Die wiederverwendbaren Templates zur schnelleren Erstellung von Nachrichten.

## 15.2 Vorlagenverwaltung

### Eine Vorlage erstellen
1. Klicken Sie in der Registerkarte **Vorlagen** auf **"Neue Vorlage"**.
2. Füllen Sie aus:
   - **Name**: Bezeichnung (z. B. "Einladung Mitgliederversammlung").
   - **Betreff**: Der E-Mail-Betreff.
   - **HTML-Text**: Der Nachrichtentext.
   - **Nur-Text**: Nur-Text-Version (für E-Mail-Clients, die kein HTML unterstützen).
   - **Kategorie**: Allgemein, Verlängerung, Veranstaltung, Aktivität, Versammlung, Steuerlich.
3. Verwenden Sie die **Seriendruckfelder** im Text:
   - `{{name}}` — Vollständiger Name des Empfängers.
   - `{{associationName}}` — Name des Vereins.
4. Klicken Sie auf **"Speichern"**.

### Eine Vorlage anwenden
Beim Erstellen einer neuen Nachricht kann eine Vorlage aus dem Dropdown-Menü ausgewählt werden. Betreff und Text werden mit den Daten der Vorlage vorausgefüllt.

## 15.3 Erstellung und Versand von Nachrichten

### Eine Nachricht erstellen
1. Klicken Sie in der Registerkarte **Nachrichten** auf **"Neue Nachricht"**.
2. Füllen Sie aus:
   - **Betreff**: Der E-Mail-Betreff.
   - **Text**: Der Nachrichteninhalt.
   - **Empfängerfilter**: Filtern Sie Mitglieder nach Status (z. B. nur Aktive).
3. Klicken Sie auf **"Als Entwurf speichern"** oder fahren Sie mit dem Versand fort.

### Empfänger auflösen
Klicken Sie vor dem Versand auf **"Empfänger auflösen"**, um:
- Die vollständige Liste der Mitglieder anzuzeigen, die die Nachricht erhalten werden.
- Die E-Mail-Adressen zu überprüfen.
- Die Gesamtzahl der Empfänger zu kontrollieren.

### Versenden
1. Klicken Sie auf **"Senden"**.
2. Das System versendet die E-Mails über den in den Einstellungen konfigurierten SMTP-Server.
3. Der Status wechselt von **Entwurf** zu **Wird gesendet** und dann zu **Gesendet**.

## 15.4 Zustellstatistiken
Für jede versendete Nachricht zeigt die Detailansicht:
- **Empfänger gesamt**: Anzahl der versendeten E-Mails.
- **Zugestellt**: Erfolgreich zugestellte E-Mails.
- **Fehlgeschlagen**: Nicht zugestellte E-Mails (mit Fehlerdetails).
- **Versanddatum**: Zeitstempel des Versands.

## 15.5 Nachrichtenstatus
| Status | Bedeutung |
|--------|-----------|
| Entwurf | Nachricht gespeichert, aber noch nicht versendet. |
| Wird gesendet | Versand läuft. |
| Gesendet | Alle Nachrichten wurden verarbeitet. |
| Fehlgeschlagen | Beim Versand sind Fehler aufgetreten. |

> **Hinweis**: Für die Nutzung der E-Mail-Kommunikation muss ein SMTP-Server in den Anwendungseinstellungen konfiguriert werden (Umgebungsvariablen SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
