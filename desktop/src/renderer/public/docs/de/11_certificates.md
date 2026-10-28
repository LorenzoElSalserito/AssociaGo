# 11. Bescheinigungen und Zertifikate

Die Seite **Zertifikate** hat zwei Registerkarten: **Vorlagen** und **Ausgestellt**. Oben finden Sie die Schaltflächen **Neue Vorlage** und **Zertifikat ausstellen**.

## 11.1 Vorlagen

Die Tabelle zeigt für jede Vorlage Name, Typ, Layout (Ausrichtung / Format) und Status **Aktiv** oder **Inaktiv**. Die Aktionen sind das **Stift**-Symbol (bearbeiten) und das **Papierkorb**-Symbol (löschen, nach der Bestätigung **Sind Sie sicher?**).

> Wurde die Vorlage bereits zum Ausstellen von Zertifikaten verwendet, schlägt das Löschen fehl und es erscheint eine Fehlermeldung der Datenbank. Es gibt keinen eigenen Hinweis.

## 11.2 Vorlage anlegen

Klicken Sie auf **Neue Vorlage**. Links gibt es vier Registerkarten, rechts die **Vorschau**.

### Allgemein
- **Name** (Pflicht: ohne Namen bleibt **Erstellen** deaktiviert). Er wird auch zum Titel des Zertifikats.
- **Typ**: Teilnahme, Anwesenheit, Schulung, Mitgliedschaft oder Benutzerdefiniert.
- **Aktiv**: Schalter.

> Der Status **Aktiv** dient nur der Information: Auch inaktive Vorlagen erscheinen bei der Ausstellung und können verwendet werden.

### Inhalt
Schreiben Sie den Text in **Textvorlage**. Die Schaltflächen über dem Feld fügen an der Cursorposition ein dynamisches Feld ein:

| Feld | Wird ersetzt durch |
|-------|----------------------|
| `{{firstName}}`, `{{lastName}}` | Vor- und Nachname des Empfängers |
| `{{fiscalCode}}` | Steuernummer des Empfängers |
| `{{associationName}}` | Name des Vereins |
| `{{date}}` | Ausstellungsdatum |
| `{{activityName}}`, `{{activityCategory}}` | Name und Kategorie der Aktivität (nur bei Ausstellung für eine Aktivität) |
| `{{eventName}}`, `{{eventType}}` | Name und Typ der Veranstaltung, als interner Code (nur bei Ausstellung für eine Veranstaltung) |

Die Felder für Aktivität und Veranstaltung bleiben als wörtlicher Text stehen, wenn das Zertifikat nicht aus einer Aktivität oder Veranstaltung heraus ausgestellt wird. Im PDF wird der Inhalt zu einfachem Text: Eventuelle HTML-Tags werden entfernt.

### Layout
- **Ausrichtung**: **Querformat** oder **Hochformat**.
- **Papierformat**: A4, A3 oder Letter.

> Das Papierformat wird gespeichert, aber nicht verwendet: Das PDF ist immer A4, in der gewählten Ausrichtung.

### Unterzeichner
Kreuzen Sie die **Unterzeichnerrollen** an: Präsident (vorausgewählt), Sekretär, Schatzmeister. Im PDF hat jede Rolle einen Unterschriftsblock mit Bild, Name und Amt aus **Einstellungen › Unterschriften** (Kapitel 16); ist für eine Rolle keine Unterschrift gespeichert, erscheint der Name aus dem **Organigramm** (**Einstellungen › Vereinsprofil**) über einer leeren Zeile.

### Vorschau
Zeigt den Titel, den Inhalt mit Beispieldaten (z. B. „Mario Rossi“) und eine Unterschriftslinie für jede angekreuzte Rolle. Folgt der gewählten Ausrichtung.

Klicken Sie auf **Erstellen** (bzw. **Speichern** beim Bearbeiten).

## 11.3 Zertifikate ausstellen

Klicken Sie auf **Zertifikat ausstellen** und wählen Sie die **Vorlage**.

### An ein Mitglied
1. Wählen Sie unter **Mitglied** einen Namen aus der Mitgliederliste des Vereins.
2. Klicken Sie auf **Ausstellen**.

### An alle Teilnehmer
Unter **Oder Sammelausstellung für alle Teilnehmer:**
- wählen Sie eine **Aktivität** und klicken Sie auf **Sammelausstellung für Aktivität**: Das Zertifikat erhalten die aktiven, als Mitglied eingeschriebenen Teilnehmer;
- oder wählen Sie eine **Veranstaltung** und klicken Sie auf **Sammelausstellung für Veranstaltung**: Das Zertifikat erhalten die als Mitglied angemeldeten Teilnehmer; Gäste werden übersprungen.

Die Schaltflächen erscheinen erst, nachdem Vorlage und Aktivität bzw. Veranstaltung gewählt wurden. Sie können auch über die Registerkarte **Zertifikate** einer Aktivität gesammelt ausstellen (Kapitel 3).

> Es gibt keine Prüfung auf Duplikate: Wiederholen Sie die Ausstellung, erhält jeder Empfänger ein neues Zertifikat.

Jedes Zertifikat erhält eine fortlaufende Nummer im Format **CERT-JAHR-NNNN**. Text und Titel werden zum Zeitpunkt der Ausstellung festgeschrieben: Spätere Änderungen an der Vorlage ändern bereits ausgestellte Zertifikate nicht. Die Unterschriften werden dagegen bei jedem Download gemäß den Rollen der Vorlage gelesen.

## 11.4 Ausgestellte Zertifikate und PDF

Die Registerkarte **Ausgestellt** (mit Zähler) listet **Zertifikat** (Nummer), **Empfänger** (Name des Mitglieds) und **Ausgestellt am** auf. Das **Download**-Symbol lädt das PDF herunter (A4, mit Nummer und Datum in der Sprache der Oberfläche), das enthält:
- Titel (Name der Vorlage), Nummer und Ausstellungsdatum;
- Inhalt mit den ausgefüllten Daten;
- einen Unterschriftsblock für jede Unterzeichnerrolle (Bild, Name und Amt);
- einen QR-Code unten rechts mit Nummer, Verein und Datum.

> Bei jedem Download wird eine SHA-256-Prüfsumme des PDF berechnet und gespeichert, aber weder auf das Dokument gedruckt noch in der Oberfläche angezeigt.
