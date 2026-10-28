# 10. Einstellungen und Datenbank

Die **Einstellungen** öffnen Sie über die Seitenleiste oder über das Vereinsmenü oben rechts. Es gibt sieben Registerkarten: **Vereinsprofil**, **Finanzen**, **Allgemein**, **Register**, **Unterschriften**, **Datenbank** und **Protokoll**.

## 10.1 Vereinsprofil

Um die Daten zu ändern, klicken Sie auf **Profil bearbeiten** und, wenn Sie fertig sind, auf **Änderungen speichern**.
- **Identität**: Vereinsname, Typ, Steuernummer, Umsatzsteuer-ID, Gründungsdatum.
- **Kontakte**: E-Mail, Telefon, Adresse, Stadt, Provinz, PLZ.
- **Organigramm**: Präsident, Vizepräsident, Sekretär, Schatzmeister. Diese Namen erscheinen in den offiziellen Dokumenten: Jahresabschluss und Unterzeichner der Zertifikate.
- **Dokumente**: Statut Pfad/Link und Satzung Pfad/Link.
- **Vereinslogo**: Klicken Sie auf **Neu hochladen** und wählen Sie eine PNG- oder JPG-Datei. Empfohlen sind 500×500 px.
- **Konfiguration**: Format der Mitgliedsnummer (`YYYY` für das Jahr, `####` für die fortlaufende Nummer) und Grundmitgliedsbeitrag.

> Das Format der Mitgliedsnummer und der Grundbeitrag werden gespeichert, aber das Mitgliedsformular wendet sie noch nicht automatisch an (siehe Kapitel 2).

## 10.2 Finanzen

Hier verwalten Sie die **Zahlungsmethoden** mit **Methode hinzufügen**:
- **Methodenname**;
- **Typ**: Bargeld, Banküberweisung, Online-Zahlung, Andere;
- **Aktiv**, also ob die Methode bei den Transaktionen verfügbar ist;
- **Provision anwenden**, mit **Feste Provision (€)** und/oder **Prozentuale Provision (%)**.

Jede Methode kann bearbeitet oder gelöscht werden.

## 10.3 Allgemein

- **Sprache**: Italienisch, Englisch, Spanisch, Deutsch, Französisch.
- **Thema**: Hell oder Dunkel. Die Auswahl gilt nach **Einstellungen speichern**. Die Sonne/Mond-Schaltfläche in der oberen Leiste wechselt das Thema sofort.
- **Oberflächenzoom**: 50 %, 75 %, 100 %, 125 %, 150 %, 175 % oder 200 %. Wird sofort angewendet und gespeichert.
- **Datenverwaltung**: **Jetzt sichern** (siehe 10.6).
- **App-Info**: Version, Lizenz, Hinweise, **Fehler melden** (öffnet eine vorausgefüllte E-Mail mit der Version) und das Feld **AssociaGo unterstützen** mit **Mit einer Spende unterstützen**.

## 10.4 Register, Unterschriften und Protokoll

- **Register**: Standorte, Dokumente und Fristen des Vereins (siehe Kapitel 18).
- **Unterschriften**: die amtlichen Unterschriften (siehe Kapitel 16).
- **Protokoll**: die Liste der Erstellungen, Änderungen und Löschungen von Daten, mit Filtern nach Bereich, Aktion und Datum (siehe Kapitel 18).

## 10.5 Datenbank

AssociaGo kann mit zwei Datenbanktypen arbeiten:

| | **Lokales SQLite** (Standard) | **Remote-MariaDB** |
|---|---|---|
| Wo die Daten liegen | In einer Datei auf dem Computer | Auf einem MariaDB-Server Ihrer Organisation |
| Typische Nutzung | Ein einzelner Arbeitsplatz | Mehrere Arbeitsplätze mit denselben Daten |
| Konfiguration | Keine | Host, Port, Datenbank, Benutzer, Passwort |

Das Feld oben zeigt die verwendete Datenbank: **Aktiv: lokales SQLite** oder **Aktiv: MariaDB**.

### MariaDB-Datenbank anbinden
1. Bitten Sie den Administrator um eine **leere, eigens dafür vorgesehene Datenbank** und einen Benutzer mit Rechten zum Lesen, Schreiben und Anlegen von Tabellen.
2. Erstellen Sie eine Sicherung (siehe 10.6).
3. Aktivieren Sie **Remote-Datenbank verwenden** und füllen Sie **Host**, **Port** (meist 3306), **Datenbankname**, **Benutzername** und **Passwort** aus.
4. Wenn der Server es vorsieht, aktivieren Sie **SSL-Verbindung verwenden**. AssociaGo prüft das Zertifikat des Servers.
5. Klicken Sie auf **Verbindung testen**. AssociaGo öffnet die Verbindung und versucht, einen temporären Wert zu schreiben und wieder zu lesen. Bei Erfolg erscheint „Verbindung geprüft: Lesen und Schreiben erfolgreich.“
6. Klicken Sie auf **Datenbankeinstellungen speichern**. Beim Speichern wird die Prüfung wiederholt: Sind die Zugangsdaten falsch, wird die Konfiguration nicht gespeichert.
7. **Schließen Sie AssociaGo und öffnen Sie es erneut.** Die neue Verbindung wird erst beim erneuten Öffnen aktiv.

Beim ersten Öffnen einer leeren Datenbank legt AssociaGo die Tabellen an und zeigt das Formular für den ersten Start (Kapitel 1), um den Verein auf dem Server anzulegen.

### Wissenswertes
- **Die Daten werden nicht übertragen.** Lokales SQLite und MariaDB bleiben zwei getrennte Datenbestände. Um die Mitglieder von einem in den anderen zu übernehmen, verwenden Sie den CSV/JSON-Export und -Import (Kapitel 2).
- Um zu SQLite zurückzukehren, deaktivieren Sie **Remote-Datenbank verwenden**, speichern und öffnen die App erneut. Die lokalen Daten sind noch vorhanden.
- Das Datenbankpasswort wird nie wieder angezeigt. Lassen Sie das Feld leer und ändern Sie Host, Benutzer und Datenbank nicht, bleibt das gespeicherte Passwort gültig.
- Verbindungsfehler zeigen weder interne Adressen noch Zugangsdaten an.

## 10.6 Sicherung

**Jetzt sichern** (Einstellungen › Allgemein) speichert eine Kopie der Datenbank im Ordner `backups` der AssociaGo-Daten (standardmäßig `~/.associago/backups`). Am Ende wird der Pfad der Datei angezeigt.

- **SQLite**: eine konsistente Kopie der Datenbank (`.db`), die auch während der Nutzung der App erstellt wird.
- **MariaDB**: ein Snapshot im JSON-Format (`.json`) aller Tabellen.

Die Sicherung umfasst nur die Datenbank: Logos und externe Dateien sind nicht enthalten.

> Die Wiederherstellung erfolgt nicht automatisch. Bei SQLite ersetzen Sie bei geschlossener App die Datenbankdatei durch die Kopie. Der JSON-Snapshot von MariaDB dient als Archiv und kann nicht über die Oberfläche importiert werden.
