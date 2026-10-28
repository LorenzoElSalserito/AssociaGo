# 13. Jahresabschluss

Die Seite **Jahresbilanz** berechnet die Jahresrechnung eines Jahres aus den in der Buchhaltung erfassten Buchungen.

## 13.1 Bilanzliste

Die Tabelle zeigt **Jahr**, **Titel**, **Status** und **Nettoergebnis** (grün wenn positiv, rot wenn negativ). Klicken Sie auf eine Zeile, um die Bilanz zu öffnen. Das **Papierkorb**-Symbol löscht sie nach der Bestätigung **Sind Sie sicher?**.

## 13.2 Bilanz berechnen

1. Klicken Sie auf **Bilanz berechnen**.
2. Geben Sie im Fenster **Jahresbilanz berechnen** das **Jahr** an.
3. Klicken Sie auf **Berechnen**.

Das System übernimmt die Buchungen vom 1. Januar bis 31. Dezember, gruppiert sie nach Kategorie (Buchungen ohne Kategorie landen unter „Sonstige Einnahmen“ bzw. „Sonstige Ausgaben“) und legt die Bilanz „Jahresabschluss JAHR“ an. Titel und allgemeine Posten werden in der Sprache geschrieben, die beim Berechnen in der Oberfläche eingestellt ist.

> Existiert für dieses Jahr bereits eine Bilanz, wird sie neu berechnet und überschrieben, auch wenn sie genehmigt war, und kehrt in einen nicht genehmigten Status zurück.

## 13.3 Detailansicht

Oben stehen drei Felder: **Gesamteinnahmen**, **Gesamtausgaben** und **Nettoergebnis**. Darunter zwei Tabellen **Einnahmen** und **Ausgaben** mit einer Zeile pro Kategorie und der Summe in Fettdruck (EINNAHMEN GESAMT, AUSGABEN GESAMT).

> Der Vergleich mit dem Vorjahr wird berechnet, aber weder auf der Seite noch im PDF angezeigt.

## 13.4 Unterzeichner

Beim Öffnen prüft das System selbstständig, ob **Präsident**, **Sekretär** und **Schatzmeister** einen Namen unter **Einstellungen › Unterschriften** oder im **Organigramm** (**Einstellungen › Vereinsprofil**) haben. Fehlt einer, erscheint der Hinweis **Fehlende Unterzeichner**, gefolgt von den Rollen als englischer Code (president, secretary, treasurer).

## 13.5 Genehmigung

**Genehmigen** setzt die Bilanz auf den Status genehmigt. Die Schaltfläche bleibt deaktiviert, solange auch nur einer der drei Unterzeichner fehlt; nach der Genehmigung verschwindet sie.

> Die Genehmigung macht die Bilanz nicht unveränderlich: Sie kann weiterhin gelöscht oder neu berechnet werden.

## 13.6 PDF

**PDF herunterladen** ist in jedem Status verfügbar, auch vor der Genehmigung, und speichert die Datei `bilancio_ANNO.pdf` im A4-Format, in der Sprache der Oberfläche (Beschriftungen, Datumsangaben und Beträge). Sie enthält:
- Name, Adresse, Stadt und Steuernummer des Vereins;
- Titel „JAHRESABSCHLUSS JAHR“ und Zeitraum;
- Einnahmen und Ausgaben nach Kategorie mit den Summen;
- „ÜBERSCHUSS“ oder „FEHLBETRAG“, Anfangs- und Endbestand;
- Abschnitt „Unterschriften“ für Präsident, Sekretär und Schatzmeister: Unterschriftsbild aus **Einstellungen › Unterschriften** (Kapitel 16), Name und Amt; ohne gespeicherte Unterschrift der Name aus dem Organigramm und eine leere Zeile;
- Datum und Uhrzeit der Erstellung und Seitenzahl.

> Das PDF enthält weder Logo noch Genehmigungsdatum.

Bei jedem Download wird eine SHA-256-Prüfsumme des PDF berechnet. Die ersten 16 Zeichen erscheinen neben dem Status, nachdem Sie die Seite verlassen und erneut geöffnet haben.

> **Hinweis**: Der Jahresabschluss ist für Einrichtungen des Dritten Sektors verpflichtend und muss von der Versammlung innerhalb der gesetzlichen Fristen genehmigt werden (in der Regel bis zum 30. April des Folgejahres).
