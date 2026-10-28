# 1. AssociaGo: Einführung, Anmeldung und Oberfläche

**AssociaGo** ist die Desktop-Verwaltungssoftware für Vereine (APS, ASD, ODV, ETS). Die Daten bleiben in einer lokalen SQLite-Datenbank oder in einer MariaDB-Datenbank Ihrer Organisation (siehe Kapitel 10).

Dieses Handbuch beschreibt die Funktionen so, wie sie in der Anwendung vorhanden sind. Ist eine Funktion nur teilweise umgesetzt, wird darauf hingewiesen.

## 1.1 Erster Start und Anmeldung

### Erster Start: Verein einrichten
Gibt es auf dem Computer noch keinen Verein, öffnet AssociaGo das Formular **Neuen Verein einrichten**, das in zwei Abschnitte gegliedert ist:

1. **Vereinsdaten**: *Vereinsname*, *Typ* (APS, ASD, ODV, ETS, Andere) und *Steuernummer (C.F.)*. Unter dem Feld wird das für die gewählte Sprache erwartete Format angezeigt: für Italienisch sind es 11 Ziffern.
2. **Administratorzugang**: *Admin-E-Mail* und *Master-Passwort* mit mindestens 6 Zeichen. Das Augensymbol blendet das Passwort ein oder aus.

Wählen Sie **Angemeldet bleiben**, wenn Sie bei den nächsten Starts automatisch angemeldet werden möchten, und klicken Sie dann auf **Datenbank initialisieren**. Fehlt ein Feld oder entspricht die Steuernummer nicht dem Format, erscheint ein Hinweis und es wird nichts angelegt. Anschließend gelangen Sie direkt in die Anwendung.

### Anmeldung
Bei den folgenden Starts sehen Sie **Verein auswählen** mit den Vereinen, die auf diesem Computer bereits verwendet wurden. Sie können sie mit der Maus oder mit der Tastatur auswählen (Tab, dann Enter).

- Wählen Sie den Verein, geben Sie das Passwort ein und klicken Sie auf **Anmelden**.
- **Angemeldet bleiben** speichert die Anmeldung: Beim nächsten Start gelangen Sie ohne Passwort hinein.
- **Weiteren Verein hinzufügen** öffnet erneut das Einrichtungsformular.
- Das Papierkorbsymbol entfernt den Verein nach einer Bestätigung aus der Liste dieses Computers. Die Daten in der Datenbank werden nicht gelöscht.
- Oben rechts befindet sich die Sprachauswahl: IT, EN, ES, DE, FR.

Beim Start prüft AssociaGo die Vereine in der Liste und entfernt diejenigen, die in der verwendeten Datenbank nicht mehr existieren, zum Beispiel nach dem Wechsel zu einer anderen Datenbank.

### Passwort-Wiederherstellung
Klicken Sie im Passwortbildschirm auf **Passwort vergessen?**. Der Ablauf öffnet sich auch automatisch nach zwei falschen Passworteingaben.

1. **Gehören diese Vereine zu Ihnen?** Wählen Sie den Verein und bestätigen Sie mit **Ja**.
2. Geben Sie die **Steuernummer des Vereins** ein, dann zweimal das neue Passwort (mindestens 6 Zeichen).
3. **Passwort zurücksetzen** speichert das neue Passwort und meldet Sie sofort an.

> Die Wiederherstellung beruht auf der hinterlegten Steuernummer. Wer Zugriff auf den Computer hat und die Steuernummer kennt, kann das Passwort zurücksetzen: Schützen Sie Ihr Betriebssystemkonto.

## 1.2 Oberfläche

### Navigation
Die Seitenleiste gruppiert die Bereiche in *Übersicht*, *Personen*, *Aktivitäten*, *Verwaltung*, *Governance* und *Hilfe*. Die Schaltfläche unten klappt sie auf die Symbole zusammen und wieder auf. Ebenfalls unten finden Sie die Version der Anwendung. Wer mit der Tastatur arbeitet, kann beim Öffnen Tab drücken, um **Zum Inhalt** zu aktivieren.

### Funktionssuche (Befehlspalette)
Klicken Sie in der oberen Leiste auf **Funktion suchen** oder drücken Sie <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> unter macOS). Geben Sie den Namen eines Bereichs ein oder „Neues Mitglied“, um sofort das Anmeldeformular zu öffnen. Mit den Pfeiltasten bewegen Sie sich, mit Enter öffnen und mit Esc schließen Sie.

### Helles und dunkles Thema
Die Sonne/Mond-Schaltfläche in der oberen Leiste wechselt das Thema und merkt es sich. Sie können es auch unter **Einstellungen › Allgemein** wählen: Dort muss die Auswahl mit **Einstellungen speichern** bestätigt werden.

### Vereinsmenü
Der Kreis mit den Initialen oben rechts zeigt Name und E-Mail des Vereins. Er enthält:
- **Einstellungen**;
- **App-Info**: Version, Lizenz AGPLv3, Hinweise und die Schaltfläche **Mit einer Spende unterstützen**;
- **Abmelden**, womit die Sitzung beendet wird. Hatten Sie *Angemeldet bleiben* gewählt, wird diese automatische Anmeldung entfernt.

### Verbindung zur Daten-Engine
AssociaGo verwendet eine lokale Engine, die zusammen mit der Anwendung startet.
- Antwortet die Engine beim Start nicht, erscheint ein Bildschirm mit **Erneut versuchen**.
- Bricht die Verbindung während der Arbeit ab, erscheint der Hinweis „Backend nicht erreichbar“ mit **Erneut versuchen**. Lesevorgänge werden wiederholt, Speichervorgänge nicht: Prüfen Sie vor dem erneuten Speichern, ob der Vorgang bereits erfolgreich war.

## 1.3 Dashboard

Das **Dashboard** ist die erste Seite nach der Anmeldung.

### Wichtigste Kennzahlen
Drei Karten, jeweils mit einem Link zum zugehörigen Bereich:
1. **Aktive Mitglieder**: Anzahl der Mitglieder mit Status *aktiv* und Anzahl der neuen Mitglieder im laufenden Monat. Maßgeblich ist der bei der Mitgliedschaft hinterlegte Status: Das Ablaufdatum wird nicht automatisch erneut geprüft.
2. **Kassenbestand**: in Finanzen erfasste Einnahmen minus Ausgaben, mit der Summe der Einnahmen (grün) und der Ausgaben (rot) des laufenden Monats.
3. **Kommende Veranstaltungen**: künftige, nicht abgesagte Veranstaltungen, mit Name und Datum der nächsten.

### Letzte Aktivitäten
Zeigt die letzten 5 Vorgänge: neue Mitglieder, Zahlungen, Veranstaltungen. **Alle anzeigen** zeigt bis zu 20 an. Der Pfeil neben jeder Zeile öffnet den zugehörigen Bereich.

### Schnellaktionen
- **Neues Mitglied registrieren** öffnet das Anmeldeformular.
- **Veranstaltung erstellen** öffnet das Formular für eine neue Veranstaltung.
- **Zahlung erfassen** führt zu Finanzen.

Lassen sich die Daten nicht laden, erscheint eine Meldung mit **Erneut versuchen**.

### Handbuch
Dieses Handbuch öffnen Sie über den Eintrag **Benutzerhandbuch** in der Seitenleiste; es folgt der Sprache der Oberfläche.
