# 7. Inventarverwaltung

Öffnen Sie **Inventar** in der Gruppe **Aktivitäten** der Seitenleiste. Hier erfassen Sie die Güter und die Ausrüstung des Vereins sowie die Ausleihen an Mitglieder.

## 7.1 Gegenstandsliste

Für jeden Gegenstand zeigt die Tabelle:
- Name und Inventarcode;
- Kategorie;
- Menge;
- Status.

**Gegenstände suchen...** filtert nach Name. Klicken Sie auf eine Zeile oder auf **Details anzeigen**, um die Detailansicht zu öffnen; die weiteren Aktionen sind **Bearbeiten** und **Löschen**.

## 7.2 Gegenstand hinzufügen

Klicken Sie auf **Gegenstand hinzufügen** und füllen Sie aus:
- **Gegenstandsname** (Pflicht) und **Inventarcode** (z. B. INV-001).
- **Beschreibung**.
- **Kategorie**: freier Text, die Kategorien legen Sie selbst fest.
- **Menge** und **Ort**.
- **Erwerbsmethode**: Kauf, Spende, Leihgabe oder Unbekannt.
- **Zugewiesen an (Benutzer-ID)**: optional; eingegeben wird die Kennnummer, nicht der Name.
- **Aktueller Wert** und **Abschreibungsjahre**, optional.
- **Zustand**: Neu, Gut, Mittel, Schlecht oder Defekt.
- **Status**: Verfügbar, In Gebrauch, Verliehen, Verloren oder Entsorgt.
- **Notizen**.

Zustand und Status sind unabhängig voneinander: Der Zustand beschreibt die physische Verfassung, der Status, wo sich der Gegenstand befindet oder wie er verwendet wird.

### Kauf
Bei **Kauf** erscheinen **Kaufpreis** und **Kaufdatum**. Beim Anlegen erfasst AssociaGo, wenn der Preis größer als null ist, automatisch eine Ausgabe in Finanzen mit diesem Betrag und dem Kaufdatum (oder dem heutigen Datum).

> Die Ausgabe wird nur beim Hinzufügen des Gegenstands erzeugt: Ändern Sie den Preis später, wird die Transaktion nicht aktualisiert.

### Wert und Abschreibung
Der aktuelle Wert wird aus dem Kaufpreis neu berechnet: Sind Preis, Kaufdatum und Abschreibungsjahre angegeben, wird für jedes vergangene Jahr ein fester Anteil abgezogen, bis null erreicht ist; andernfalls entspricht er dem Kaufpreis.

> Ein in **Aktueller Wert** von Hand eingegebener Wert bleibt nicht erhalten: Beim Lesen wird er durch den berechneten Wert ersetzt.

Klicken Sie auf **Erstellen** (bzw. **Aktualisieren** beim Bearbeiten).

## 7.3 Detailansicht

Oben finden Sie die Schaltfläche **Bearbeiten** und drei Kennzahlen: **Menge**, **Zustand** und **Status**. Unter dem Namen erscheinen Kategorie und Ort.

### Ausleihverlauf
Klicken Sie auf **Ausleihe registrieren** und geben Sie an:
- **Mitglied auswählen** (Pflicht);
- **Ausleihdatum** und **Voraussichtliches Rückgabedatum**;
- **Zustand bei Ausleihe**: Neu, Gut, Mittel, Schlecht oder Defekt;
- **Notizen**.

Die Tabelle zeigt **Mitglieds-ID**, **Ausleihdatum**, **Rückgabedatum** (bzw. das voraussichtliche Datum gefolgt von „(Exp)“, solange der Gegenstand nicht zurück ist) und Status. Bei laufenden Ausleihen klicken Sie auf **Zurückgeben** und bestätigen: Es wird das heutige Datum erfasst.

> Das Erfassen oder Abschließen einer Ausleihe ändert weder Status noch Menge des Gegenstands: Aktualisieren Sie diese von Hand mit **Bearbeiten**. Der Zustand bei Rückgabe wird nicht erfasst.
