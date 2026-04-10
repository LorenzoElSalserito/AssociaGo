# 18. Compliance und Audit

Der Bereich **Audit** zeichnet automatisch alle sensiblen Vorgänge auf der Plattform auf und gewährleistet die vollständige Nachverfolgbarkeit, die von der Gesetzgebung des Dritten Sektors gefordert wird.

## 18.1 Was ist das Audit-Log
Das Audit-Log ist ein unveränderliches Register, das dokumentiert:
- **Wer** den Vorgang durchgeführt hat (Benutzer).
- **Was** gemacht wurde (Art der Aktion).
- **Wann** es geschehen ist (genauer Zeitstempel).
- **An welcher Entität** die Aktion durchgeführt wurde (Mitglied, Transaktion, Veranstaltung usw.).
- **Welche Werte** sich geändert haben (vorher/nachher, wenn verfügbar).

## 18.2 Erfasste Vorgänge
Das System zeichnet automatisch die wichtigsten Vorgänge auf, darunter:
- Anlegen, Ändern und Löschen von Mitgliedern.
- Erfassung und Änderung von Finanztransaktionen.
- Erstellung und Versand von Mitteilungen.
- Genehmigung von Abschlüssen.
- Ausstellung von Bescheinigungen.
- Änderungen an den Vereinseinstellungen.
- Verwaltung der Anwesenheiten.

## 18.3 Einsicht in das Log

### Zugriff
Das Audit-Log ist über die System-APIs einsehbar. Die verfügbaren Informationen umfassen:

### Verfügbare Filter
- **Nach Verein**: Zeigt nur die Vorgänge eines bestimmten Vereins an.
- **Nach Entität**: Filtern nach Entitätstyp (z. B. "MEMBER", "TRANSACTION") und spezifischer ID.
- **Nach Datum**: Wählen Sie einen Zeitraum mit Start- und Enddatum.
- **Nach Benutzer**: Filtern der Aktionen eines bestimmten Benutzers.

### Paginierung
Die Ergebnisse sind paginiert, um große Datenmengen zu verwalten. Folgendes kann angegeben werden:
- **Seite**: Nummer der aktuellen Seite.
- **Größe**: Anzahl der Datensätze pro Seite (Standard 50).

## 18.4 Vorgangsanzahl
Es steht ein Endpunkt zur Verfügung, um die Gesamtanzahl der für einen Verein erfassten Vorgänge abzurufen — nützlich für Dashboards und Statistiken.

## 18.5 Technische Merkmale
- **Unabhängige Transaktion**: Jeder Audit-Eintrag wird in einer separaten Transaktion geschrieben. Selbst wenn der Hauptvorgang fehlschlägt, wird der Versuch dennoch im Log erfasst.
- **Unveränderlichkeit**: Audit-Einträge können weder geändert noch gelöscht werden.
- **Indizierung**: Das Log ist nach Verein, Entität, Benutzer und Datum indiziert, um schnelle Suchen zu gewährleisten.

## 18.6 Bedeutung für den Dritten Sektor
Die Nachverfolgbarkeit der Vorgänge ist eine grundlegende Anforderung für:
- **Gesetzliche Prüfung**: Organisationen mit Einnahmen über bestimmten Schwellenwerten unterliegen der Prüfungspflicht.
- **Steuerliche Kontrollen**: Die Finanzbehörden können detaillierte Dokumentation anfordern.
- **Transparenz**: Mitglieder haben ein Recht auf Einsicht in die Vereinsdokumente.
- **GDPR-Compliance**: Das Log dokumentiert, wer Vorgänge an personenbezogenen Daten durchgeführt hat.

> **Hinweis**: Das Audit-Log ist eine interne Sicherheitsfunktion. Der Zugriff auf das Log sollte auf die Vereinsadministratoren und Rechnungsprüfer beschränkt sein.
