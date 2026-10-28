# 15. Kommunikation

Die Seite **Kommunikation** (Seitenleiste, Gruppe **Governance**) dient dazu, E-Mails an die Mitglieder vorzubereiten und zu versenden. Sie hat zwei Registerkarten: **Nachrichten** und **Vorlagen**; neben jeder zeigt ein Zähler, wie viele Elemente sie enthält.

## 15.1 Vorlagen

Klicken Sie in der Registerkarte **Vorlagen** auf **Neue Vorlage** und füllen Sie aus:
- **Name** (Pflicht, ohne ihn bleibt die Schaltfläche **Erstellen** deaktiviert);
- **Betreff**;
- **Inhalt (HTML)**: der Text der Nachricht. Sie können die Platzhalter `{{name}}` (Vor- und Nachname des Empfängers) und `{{associationName}}` (Name des Vereins) verwenden.

Die Tabelle zeigt **Vorlagenname** und **Betreff**. Die Aktionen jeder Zeile sind Bearbeiten (Stift, dann **Speichern**) und Löschen (Papierkorb, mit Bestätigung).

## 15.2 Nachricht anlegen

Klicken Sie in der Registerkarte **Nachrichten** auf **Neue Nachricht**.
- **Vorlage anwenden**: erscheint nur, wenn mindestens eine Vorlage existiert, und nur bei neuen Nachrichten. Kopiert Betreff und Inhalt der Vorlage in die Nachricht.
- **Betreff** (Pflicht).
- **Absendername** und **Absender-E-Mail**. Die E-Mail-Adresse wird zum Absender der Nachricht; lassen Sie sie leer, wird `noreply@associago.local` verwendet. Der Absendername wird gespeichert, erscheint aber nicht in der E-Mail.
- **Segmentfilter**: freies Textfeld. Enthält es das Wort `active`, geht die Nachricht nur an Mitglieder mit aktiver Mitgliedschaft; jeder andere Text oder ein leeres Feld bedeutet alle Mitglieder des Vereins mit einer E-Mail-Adresse.
- **Nachrichtentext (HTML)**, mit denselben Platzhaltern wie die Vorlagen.

Klicken Sie auf **Erstellen**. Die Nachricht wird im Status **Entwurf** angelegt.

Die Nachrichtentabelle zeigt **Betreff**, **Status**, Anzahl der **Empfänger** und **Datum** der Erstellung. Nur Entwürfe können bearbeitet werden (Stift); der Papierkorb löscht die Nachricht nach einer Bestätigung.

## 15.3 Empfänger und Versand

Klicken Sie auf eine Nachricht, um ihre Detailansicht zu öffnen. Bei einem Entwurf:
1. Klicken Sie auf **Empfänger auflösen**: Die App ermittelt die Liste aus den Mitgliedern des Vereins anhand des Segmentfilters und zeigt an, wie viele Empfänger gefunden wurden. Jede E-Mail-Adresse erscheint nur einmal; klicken Sie erneut, wird die Liste von Grund auf neu berechnet;
2. klicken Sie auf **Senden** (erst aktiv, nachdem die Empfänger aufgelöst wurden) und bestätigen Sie.

Die E-Mail wird als einfacher Text versendet: Der im Editor geschriebene Inhalt wird unter Beibehaltung von Absätzen und Zeilenumbrüchen umgewandelt, ohne Formatierung. Testen Sie vor einer wichtigen Mitteilung einen Versand an eine eigene Adresse.

## 15.4 Details und Statistiken

Oben stehen vier Felder: **Empfänger gesamt**, **Zugestellt**, **Fehlgeschlagen** und **Gesendet am**. Darunter finden Sie den **Nachrichteninhalt** und die Tabelle **Empfänger** mit Name, E-Mail, Status (Ausstehend, Gesendet oder Fehlgeschlagen) und Versandzeit.

„Zugestellt“ bedeutet, dass der Mailserver die E-Mail angenommen hat, nicht dass sie im Postfach des Mitglieds angekommen ist.

Nach Abschluss des Versands wechselt die Nachricht zu **Gesendet**; hat der Server keine E-Mail angenommen, wechselt sie zu **Fehlgeschlagen**. Bei teilweisem Versand prüfen Sie das Feld **Fehlgeschlagen** und die Statusspalte der Empfänger.

## 15.5 Mailserver konfigurieren

In der App gibt es keinen Bildschirm für den E-Mail-Server: Er muss vom Administrator konfiguriert werden, indem vor dem Start von AssociaGo diese Umgebungsvariablen gesetzt werden.

| Variable | Wozu sie dient | Wert, falls nicht gesetzt |
|---|---|---|
| `SMTP_HOST` | Adresse des Postausgangsservers | `localhost` |
| `SMTP_PORT` | Port des Servers (meist 587 oder 25) | `25` |
| `SMTP_USER` | Benutzername des Postfachs | leer |
| `SMTP_PASSWORD` | Passwort des Postfachs | leer |
| `SMTP_AUTH` | `true`, wenn der Server Benutzername und Passwort verlangt | `false` |
| `SMTP_TLS` | `true`, um die verschlüsselte STARTTLS-Verbindung zu verwenden | `false` |

Ohne diese Einstellungen sucht die App einen Mailserver auf dem Computer selbst: Fast immer gibt es dort keinen, daher landen alle E-Mails unter **Fehlgeschlagen**.
