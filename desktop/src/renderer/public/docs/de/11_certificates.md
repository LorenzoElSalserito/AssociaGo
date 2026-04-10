# 11. Bescheinigungen und Zertifikate

Der Bereich **Bescheinigungen** ermöglicht es, anpassbare Vorlagen zu erstellen und Zertifikate für Mitglieder, Aktivitätsteilnehmer und Veranstaltungsteilnehmer auszustellen.

## 11.1 Überblick

Die Seite ist in zwei Hauptregisterkarten unterteilt:
- **Vorlagen**: Die Templates, aus denen die Bescheinigungen generiert werden.
- **Ausgestellt**: Die Liste aller bereits generierten Bescheinigungen, mit der Möglichkeit, sie als PDF herunterzuladen.

## 11.2 Vorlagenverwaltung

### Eine neue Vorlage erstellen
Klicken Sie auf **"Neue Vorlage"**, um das Erstellungsfenster zu öffnen. Das Fenster ist in vier Abschnitte gegliedert:

#### Allgemein
- **Name**: Der Bezeichnungsname der Vorlage (z. B. "Teilnahmebescheinigung Grundkurs").
- **Typ**: Wählen Sie die Art aus:
  - *Teilnahme* — für die Teilnahme an einer Aktivität oder Veranstaltung.
  - *Anwesenheit* — für den Abschluss eines Kurses mit Mindestanwesenheit.
  - *Ausbildung* — für Schulungskurse mit Zertifizierung.
  - *Mitgliedschaft* — Bescheinigung der Zugehörigkeit zum Verein.
  - *Benutzerdefiniert* — freies Format für besondere Anforderungen.
- **Aktiv**: Schalter zum Aktivieren/Deaktivieren der Vorlage. Nur aktive Vorlagen können zur Ausstellung verwendet werden.

#### Textinhalt
Hier wird der Text der Bescheinigung verfasst. Eine Reihe von **Schaltflächen für dynamische Felder** ermöglicht das Einfügen von Platzhaltern, die automatisch durch die tatsächlichen Daten ersetzt werden:

| Feld | Beschreibung |
|------|-------------|
| `{{firstName}}` | Vorname des Mitglieds |
| `{{lastName}}` | Nachname des Mitglieds |
| `{{fiscalCode}}` | Steuernummer |
| `{{associationName}}` | Name des Vereins |
| `{{date}}` | Ausstellungsdatum |
| `{{activityName}}` | Name der verknüpften Aktivität |
| `{{activityCategory}}` | Kategorie der Aktivität |
| `{{eventName}}` | Name der verknüpften Veranstaltung |
| `{{eventType}}` | Art der Veranstaltung |

Klicken Sie auf eine Schaltfläche, um das Feld an der aktuellen Cursorposition im Text einzufügen.

#### Seitenlayout
- **Ausrichtung**: Querformat (Landscape) oder Hochformat (Portrait).
- **Papierformat**: A4, A3 oder Letter.

#### Unterzeichner
Wählen Sie aus, welche Amtsträger die Bescheinigung unterzeichnen sollen:
- Vorsitzender
- Schriftführer
- Schatzmeister

Die Unterschriften werden am Ende des generierten PDF-Zertifikats platziert und die Unterschriftsbilder automatisch aus dem Bereich Einstellungen > Unterschriften übernommen.

### Echtzeitvorschau
Auf der rechten Seite des Fensters zeigt ein **Vorschaubereich** an, wie die Bescheinigung aussehen wird. Die dynamischen Felder werden durch Beispieldaten ersetzt (z. B. "Max Mustermann"), um einen Eindruck des Endergebnisses zu vermitteln. Die Vorschau spiegelt auch die Ausrichtung und den Aktiv-/Inaktiv-Status wider.

### Eine Vorlage bearbeiten
Klicken Sie auf das **Stift**-Symbol in der Zeile der Vorlage, um das Fenster mit allen vorausgefüllten Daten zu öffnen.

### Eine Vorlage löschen
Klicken Sie auf das **Papierkorb**-Symbol. Es wird eine Bestätigung vor dem Löschen angefordert. Vorlagen mit bereits ausgestellten Bescheinigungen können nicht gelöscht werden.

## 11.3 Ausstellung von Bescheinigungen

### Einzelausstellung
1. Klicken Sie auf **"Zertifikat ausstellen"**.
2. Wählen Sie die **Vorlage** aus dem Dropdown-Menü.
3. Geben Sie die **Mitglieds-ID** des Empfängers ein.
4. Klicken Sie auf **"Ausstellen"**.

Das System generiert eine Bescheinigung mit einer eindeutigen Nummer (Format: CERT-JAHR-NNNN) und ordnet sie dem Mitglied zu.

### Massenausstellung (Batch)
Um Bescheinigungen an alle Teilnehmer einer Aktivität oder Veranstaltung auszustellen:
1. Wählen Sie die Vorlage aus.
2. Wählen Sie im unteren Bereich eine **Aktivität** oder eine **Veranstaltung** aus dem Dropdown-Menü.
3. Klicken Sie auf **"Batch-Ausstellung für Aktivität"** oder **"Batch-Ausstellung für Veranstaltung"**.

Alle aktiven Teilnehmer erhalten eine Bescheinigung.

## 11.4 PDF-Download
In der Registerkarte **Ausgestellt** hat jede Bescheinigung eine **Download**-Schaltfläche. Das generierte PDF enthält:
- Titel und Text der Bescheinigung mit den ausgefüllten Daten.
- Eindeutige Zertifikatsnummer.
- Ausstellungsdatum.
- Amtliche Unterschriften.
- SHA-256-Prüfsumme zur Echtheitsverifizierung.
