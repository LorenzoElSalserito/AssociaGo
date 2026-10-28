# 9. Gutscheine und Rabatte

Gutscheine sind Rabattcodes für Aktivitäten und Veranstaltungen. Sie verwalten sie an drei Stellen, die dieselbe Liste zeigen:
- über den Eintrag **Gutscheine** in der Gruppe **Aktivitäten** der Seitenleiste;
- über die Registerkarte **Gutscheine** der Seite **Aktivitäten und Gutscheine**;
- über die Registerkarte **Gutscheine** der Seite **Veranstaltungen und Gutscheine**.

## 9.1 Gutscheinliste

Für jeden Gutschein zeigt die Tabelle:
- **Code**;
- **Rabatt**: Prozentsatz oder Betrag in Euro, mit dem Mindestbetrag, falls festgelegt;
- **Gültigkeit**: Start- und Enddatum (∞, wenn ohne Ablauf);
- **Nutzungen**: mit dem Gutschein gespeicherte Anmeldungen im Verhältnis zum zulässigen Maximum (∞, wenn unbegrenzt);
- **Status**: **Aktiv** oder **Inaktiv**.

Die Aktionen jeder Zeile sind **Bearbeiten** und **Löschen**.

## 9.2 Gutschein anlegen

Klicken Sie auf **Gutschein hinzufügen** und füllen Sie aus:
- **Gutscheincode** (Pflicht), z. B. ESTATE2026.
- **Beschreibung**.
- **Rabattart**: Prozentsatz oder Festbetrag.
- **Rabattwert** (Pflicht).
- **Startdatum** (standardmäßig heute) und **Enddatum**.
- **Max. Nutzungen (0 für unbegrenzt)**.
- **Mindestbetrag**.
- **Anwendbare Aktivitäten** und **Anwendbare Veranstaltungen**: Mehrfachauswahl. Wählen Sie mindestens eine Aktivität oder Veranstaltung, gilt der Gutschein nur für die ausgewählten; lassen Sie beide Listen leer, damit er überall gilt.
- **Aktiv**.

Klicken Sie auf **Gutschein speichern**.

## 9.3 Verwendung

Der Code wird in das Feld **Gutscheincode** des Formulars **Teilnehmer hinzufügen** eingegeben, sowohl bei Aktivitäten als auch bei Veranstaltungen (Mitglieder und Gäste). Groß- und Kleinschreibung spielen keine Rolle. Klicken Sie auf **Anwenden**, um Preis, Rabatt und **Zu zahlender Betrag** vor dem Speichern zu sehen.

Der Ausgangspreis ist:
- bei Aktivitäten die Kosten der Aktivität;
- bei Veranstaltungen die Kosten für Mitglieder bei Mitgliedern und die Kosten für Nicht-Mitglieder bei Gästen.

Der prozentuale Rabatt wird auf den Cent gerundet; der feste Rabatt übersteigt nie den Preis, daher fällt der zu zahlende Betrag nicht unter null.

Der Gutschein wird mit einer Meldung abgelehnt, wenn:
- der Code im Verein nicht existiert;
- er nicht **Aktiv** ist;
- heute vor dem **Startdatum** oder nach dem **Enddatum** liegt (das Enddatum ist eingeschlossen);
- er **Max. Nutzungen** erreicht hat (0 = unbegrenzt);
- der Preis unter dem **Mindestbetrag** liegt;
- er nicht für die gewählte Aktivität oder Veranstaltung gilt (siehe 9.2).

Beim Speichern prüft das Programm den Gutschein erneut: Ist er inzwischen nicht mehr gültig, wird die Anmeldung nicht gespeichert. Ist er gültig, bleiben Gutschein, Rabatt und zu zahlender Betrag beim Teilnehmer gespeichert, und **Nutzungen** steigt um 1. Der Gutschein erscheint als Etikett in der Teilnehmertabelle, und die **Einnahmen** verwenden den rabattierten Betrag.

> Das Entfernen eines Teilnehmers gibt die Nutzung **nicht** zurück: Der Zähler zählt die verwendeten Gutscheine, auch bei später gelöschten Anmeldungen. Erhöhen Sie bei Bedarf **Max. Nutzungen** im Bearbeitungsformular.
