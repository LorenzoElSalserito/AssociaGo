# 4. Veranstaltungsverwaltung

Die Seite **Veranstaltungen und Gutscheine** enthält zwei Registerkarten: **Veranstaltungen** (Feste, Treffen, Spendenaktionen, Konferenzen) und **Gutscheine** (siehe Kapitel 9).

## 4.1 Veranstaltungsliste

Für jede Veranstaltung zeigt die Tabelle:
- Titel;
- Datum;
- Ort;
- Status.

**Veranstaltungen suchen...** filtert die Liste. In jeder Zeile gibt es die Aktionen **Details anzeigen**, **Bearbeiten** und **Löschen**.

## 4.2 Veranstaltung anlegen

Klicken Sie auf **Veranstaltung hinzufügen** und füllen Sie aus:
- **Veranstaltungsname** und **Typ**, beide Pflicht. Die Typen sind Treffen / Versammlung, Party, Spendenaktion, Kongress, Konferenz, Andere.
- **Status**: Geplant, Bestätigt, Laufend, Abgeschlossen oder Abgesagt. Abgesagte Veranstaltungen erscheinen nicht unter den kommenden Veranstaltungen im Dashboard.
- **Startdatum** (Pflicht), **Startzeit**, **Enddatum**, **Endzeit**.
- **Ort**, **Adresse** und **Beschreibung**.
- **Kosten für Mitglieder** und **Kosten für Nicht-Mitglieder**.
- **Max. Teilnehmer**. Lassen Sie das Feld leer, sind die Plätze unbegrenzt.
- Die Optionen **Öffentliche Veranstaltung**, **Anmeldung erforderlich** und **Rechnung erstellen**.

## 4.3 Detailansicht

### Kennzahlen
- **Registriert**: Anzahl der Angemeldeten, ohne Abgesagte und Warteliste.
- **Eingecheckt**: Anzahl der Teilnehmer, die eingecheckt haben.
- **Anwesenheitsrate**: Anwesende geteilt durch Angemeldete.
- **Einnahmen**: Summe der erfassten Zahlungen; bei Teilnehmern, die als Bezahlt markiert sind, ohne dass ein Betrag erfasst wurde, zählt der bereits rabattierte zu zahlende Betrag.

### Teilnehmer
**Teilnehmer hinzufügen** bietet zwei **Teilnehmertypen** an:
- **Mitglied**: wird aus der Mitgliederliste ausgewählt.
- **Gast (Extern)**: Name und E-Mail werden angegeben.

Der zu zahlende Betrag sind die **Kosten für Mitglieder** bei Mitgliedern und die **Kosten für Nicht-Mitglieder** bei Gästen. Das optionale Feld **Gutscheincode** wendet einen Rabatt an (siehe 9.3); die Tabelle zeigt den zu zahlenden Betrag und, falls verwendet, den Gutschein mit dem Rabatt.

Für jeden Teilnehmer zeigt die Tabelle Status, Anwesenheit und Zahlung, mit der Aktion zum Entfernen. Das Feld **Teilnehmer nach Name oder E-Mail suchen** filtert die Zeilen: nützlich beim Einlass mit langen Listen.

In jeder Zeile:
- **Einchecken**: markiert den Teilnehmer als anwesend und erfasst die Ankunftszeit, die unter der Schaltfläche angezeigt wird. Die Schaltfläche wird zu **Anwesend**; klicken Sie erneut darauf, um den Check-in rückgängig zu machen. Teilnehmer mit abgesagter Anmeldung können nicht einchecken.
- **Zahlungsstatus**: Wählen Sie im Menü der Zeile Ausstehend, Bezahlt, Erlassen oder Erstattet. Die Änderung wird sofort gespeichert.

Nach jeder Aktion werden die Kennzahlen oben aktualisiert.

### Zertifikate
Wählen Sie eine Vorlage und klicken Sie auf **Sammelausstellung**: Jeder als Mitglied angemeldete Teilnehmer erhält ein Zertifikat. Externe Gäste erhalten keine namentlichen Zertifikate.

### CSV-Import
Hier importieren Sie die Teilnehmer aus einer CSV-Datei. Der Ablauf (Vorschau, dann Bestätigung) ist derselbe wie bei den Aktivitäten: siehe Kapitel 3.
