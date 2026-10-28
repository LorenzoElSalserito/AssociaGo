# 2. Mitgliederverwaltung

Der Bereich **Mitglieder** enthält die Stammdaten der im Verein eingeschriebenen Personen und ihre Mitgliedschaften.

## 2.1 Mitgliederliste

Die Tabelle zeigt Name, E-Mail, Rolle, Ablaufdatum und Status jedes Mitglieds.
- **Mitglieder suchen...** filtert nach Vorname, Nachname oder E-Mail.
- Die Aktionen jeder Zeile sind **Bearbeiten**, **Mitgliedschaft erneuern** und **Löschen**.
- Bei Vereinen des Typs **ASD** wird auch der Status des sportärztlichen Attests angezeigt. Oben in der Liste weist ein Hinweis auf abgelaufene und innerhalb von 30 Tagen ablaufende Atteste hin.

## 2.2 Neues Mitglied und Bearbeiten

Klicken Sie auf **Mitglied hinzufügen** oder verwenden Sie *Neues Mitglied registrieren* im Dashboard bzw. „Neues Mitglied“ in der Funktionssuche (<kbd>Ctrl</kbd>+<kbd>K</kbd>).

### Stammdaten
- **Vorname**, **Nachname**, **Geburtsdatum** und **Geschlecht** sind Pflichtfelder.
- **Katastercode (z. B. H501)** ist der Code der Geburtsgemeinde (H501 steht für Rom).
- **Steuernummer** ist Pflicht. Die Schaltfläche **Berechnen** ermittelt sie aus Vorname, Nachname, Geburtsdatum, Geschlecht und Katastercode.
- Kontakt: **E-Mail**, **Telefon**, **Adresse**, **Stadt**, **PLZ**.

### Mitgliedschaft
- **Ausweisnummer**: freies Feld.
- **Registrierungsdatum (Zahlungseingang)**: Pflicht, darf nicht in der Zukunft liegen. Gilt auch als Zahlungsdatum.
- **Art / Ämter**: Sie können mehrere ankreuzen (Ordentliches Mitglied, Gründungsmitglied, Ehrenmitglied, Vorsitzende/r, Stellv. Vorsitzende/r, Schriftführer/in, Kassenwart/in, Vorstandsmitglied).

### Mitgliedsbeitrag
Nur bei einem neuen Mitglied legt **Zahlung des Mitgliedsbeitrags erfassen** auch die Einnahme in Finanzen an:
- vorgeschlagener Betrag 20,00 €, änderbar;
- Zahlungsmethode wählbar zwischen Bargeld, Banküberweisung, Kartenterminal / Karte und PayPal.

Beim Bearbeiten ist das Kästchen nicht verfügbar: Spätere Zahlungen werden in Finanzen erfasst. Das Format der Mitgliedsnummer und der Grundmitgliedsbeitrag aus den Einstellungen werden in diesem Formular noch nicht automatisch angewendet.

### Sportärztliches Attest (nur ASD)
Der Abschnitt **Sportärztliches Attest** erfasst:
- Art (Wettkampfmäßig oder Nicht-wettkampfmäßig);
- Ausstellungs- und Ablaufdatum;
- ausstellenden Arzt, Einrichtung und Notizen.

## 2.3 Erneuerung und Löschen

- **Mitgliedschaft erneuern** fragt nach einer Bestätigung und verschiebt das Ablaufdatum auf **ein Jahr ab heute**. Die Erneuerung erfasst keine Zahlung: Der Beitrag muss in Finanzen erfasst werden.
- **Löschen** fragt nach einer Bestätigung und entfernt die Mitgliedschaft des Mitglieds in diesem Verein.

## 2.4 CSV/JSON-Import und -Export

Klicken Sie auf **CSV importieren**, um den Bereich **Mitglieder importieren/exportieren** zu öffnen. Zum Schließen verwenden Sie **CSV-Import ausblenden**.

1. **CSV-Beispiel** / **JSON-Beispiel** laden eine Beispieldatei mit den vorgesehenen Spalten herunter.
2. **CSV exportieren** / **JSON exportieren** laden alle aktuellen Mitglieder herunter.
3. Wählen Sie eine CSV- oder JSON-Datei und klicken Sie auf **Vorschau erstellen**. Die Übersicht nennt Zeilen gesamt, gültige, doppelte und fehlerhafte Zeilen.
4. **Import bestätigen** importiert alle gültigen Zeilen in einem einzigen Vorgang.

Regeln:
- ist eine Zeile ungültig, wird der Import blockiert und es werden keine Daten geschrieben;
- bereits vorhandene Mitglieder werden übersprungen, ohne Daten zu überschreiben;
- Grenze von 5000 Zeilen und 5 MB pro Datei;
- beim CSV-Export werden Zellen, die mit `=`, `+`, `-` oder `@` beginnen, geschützt, damit Tabellenkalkulationen sie nicht als Formeln ausführen.

> Der druckbare Mitgliedsausweis ist über die Oberfläche noch nicht verfügbar.
