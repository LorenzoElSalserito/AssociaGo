# 6. Versammlungsverwaltung

Öffnen Sie **Versammlungen** in der Gruppe **Organisation** der Seitenleiste. Hier erfassen Sie die Mitgliederversammlungen, die Anwesenheiten und die Anträge und laden das Protokoll herunter.

## 6.1 Versammlungsliste

Für jede Versammlung zeigt die Tabelle:
- Titel und Typ;
- Datum und Uhrzeit;
- Quorum der ersten Einberufung (in Prozent);
- Status.

**Versammlungen suchen...** filtert nach Titel. Klicken Sie auf eine Zeile oder auf **Details anzeigen**, um die Detailansicht zu öffnen; die weiteren Aktionen sind **Bearbeiten** und **Löschen**.

## 6.2 Versammlung anlegen

Klicken Sie auf **Neue Versammlung** und füllen Sie aus:
- **Titel** (Pflicht) und **Beschreibung**.
- **Datum** (Pflicht, mit Uhrzeit), **Startzeit** und **Endzeit**.
- **Ort**.
- **Typ**: Ordentlich oder Außerordentlich.
- **Status**: Entwurf, Einberufen, Laufend, Geschlossen oder Abgesagt. Der Status wird von Hand geändert, indem Sie die Versammlung bearbeiten.
- **Präsident** und **Sekretär**: freier Text, nicht mit der Mitgliederliste verknüpft.
- **Quorum Erste Einberufung (%)** und **Quorum Zweite Einberufung (%)**: Standardwerte 50 und 33.
- **Notizen**.

Klicken Sie auf **Erstellen** (bzw. **Aktualisieren** beim Bearbeiten).

## 6.3 Detailansicht

Oben finden Sie die Schaltflächen **Protokoll** und **Bearbeiten** sowie vier Kennzahlen:
- **Status**;
- **Anwesend**: als anwesend erfasste Teilnehmer;
- **Vollmacht**: per Vollmacht erfasste Teilnehmer;
- **Quorum**: **Erreicht** oder **Nicht erreicht**.

Das Quorum wird berechnet, indem Anwesende und Vollmachten addiert und mit der Zahl der aktiven Mitglieder verglichen werden. Es ist erreicht, wenn der Prozentsatz die Schwelle der ersten oder der zweiten Einberufung erreicht: In der Praxis genügt die niedrigere Schwelle.

Darunter gibt es drei Registerkarten.

### Teilnehmer
Klicken Sie auf **Anwesenheit registrieren** und geben Sie an:
- **Mitglied auswählen** (Pflicht);
- **Teilnahmeart**: Anwesend, Vollmacht oder Abwesend;
- **Rolle**: Mitglied, Präsident, Sekretär oder Stimmzähler;
- **Bevollmächtigter**: erscheint nur bei der Art Vollmacht; wählen Sie das Mitglied, das die Vollmacht erhält;
- **Notizen**.

Die Uhrzeit der Erfassung wird automatisch gespeichert. Die Tabelle zeigt Name des Mitglieds, Teilnahmeart, Rolle und Bevollmächtigten. Mit **Bearbeiten** (Stift-Symbol) ändern Sie Mitglied, Art, Rolle, Bevollmächtigten und Notizen; mit **Löschen** entfernen Sie die Erfassung.

> Anwesende und Vollmachten bestimmen das Quorum und die Höchstzahl der Stimmen, die bei jedem Antrag erfasst werden können: Aktualisieren Sie die Anwesenheiten, bevor Sie die Stimmen erfassen.

### Anträge
Klicken Sie auf **Antrag hinzufügen** und füllen Sie aus:
- **Titel** (Pflicht) und **Beschreibung**;
- **Abstimmungsart**: Einfache Mehrheit, Qualifizierte Mehrheit, Einstimmigkeit oder Beratend;
- **Bestellnummer**;
- **Geplant (auf der Tagesordnung)**;
- **Notizen**.

Klicken Sie auf **Antrag speichern**. Die Tabelle, sortiert nach Bestellnummer, zeigt Abstimmungsart, Stimmen und **Ergebnis**. Die Aktionen sind **Abstimmung erfassen**, **Bearbeiten** (alle Felder des Antrags) und **Löschen**.

**Abstimmung erfassen** öffnet ein Fenster mit **Dafür**, **Dagegen** und **Enthaltungen**. Während der Eingabe sehen Sie die abgegebenen Stimmen im Verhältnis zu den Stimmberechtigten (Anwesende + Vollmachten) und das berechnete Ergebnis. Die Zahlen müssen nicht negative ganze Zahlen sein, und die Summe darf Anwesende plus Vollmachten nicht übersteigen; ohne Anwesende oder Vollmachten wird keine Abstimmung erfasst. Klicken Sie auf **Abstimmung speichern**; **Abstimmung zurücksetzen** setzt den Antrag auf **Ausstehend** zurück.

Das Ergebnis berechnet das Programm anhand der Abstimmungsart:
- **Einfache Mehrheit**: angenommen, wenn die Ja-Stimmen die Nein-Stimmen übersteigen (bei Gleichstand abgelehnt);
- **Qualifizierte Mehrheit**: angenommen mit mindestens 2/3 Ja-Stimmen der abgegebenen Stimmen, Enthaltungen eingeschlossen;
- **Einstimmigkeit**: angenommen, wenn es keine Nein-Stimmen und mindestens eine Ja-Stimme gibt;
- **Beratend**: kein verbindliches Ergebnis, der Antrag gilt als **Zur Kenntnis genommen**.

Ändern Sie die Abstimmungsart eines bereits abgestimmten Antrags, wird das Ergebnis mit den erfassten Stimmen neu berechnet.

### Dokumente
Klicken Sie auf **Dokument hinzufügen** und geben Sie **Dokumentname** (Pflicht), **Dokumenttyp** (Protokoll, Einberufung, Anhang, Jahresabschluss), **Beschreibung** und **Pflichtdokument** an.

> Das Feld **Datei** ist deaktiviert: Das Hochladen von Dateien ist noch nicht verfügbar, daher wird nur der Name des Dokuments erfasst.

## 6.4 Protokoll

**Protokoll** lädt ein A4-PDF in der Sprache der Oberfläche herunter mit:
- Titel, Typ, Datum, Ort, Präsident und Sekretär der Versammlung;
- Quorum der ersten und zweiten Einberufung und ob es erreicht wurde;
- Namen der Anwesenden und der per Vollmacht Teilnehmenden, mit dem jeweiligen Bevollmächtigten;
- für jeden Antrag, in Reihenfolge: Abstimmungsart, Ja-Stimmen, Nein-Stimmen und Enthaltungen, Ergebnis (Angenommen, Abgelehnt, Zur Kenntnis genommen oder Abstimmung ausstehend) und gegebenenfalls Beschluss;
- die Unterschriften von Präsident und Sekretär.

Lange Anträge werden auf den folgenden Seiten fortgesetzt. Für die Unterschriften gilt das in Kapitel 16 Beschriebene: Das Bild aus **Einstellungen › Unterschriften** erscheint nur, wenn der in der Versammlung angegebene Name mit dem der gespeicherten Unterschrift übereinstimmt; andernfalls bleibt die leere Zeile für die handschriftliche Unterschrift.
