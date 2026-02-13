# 2. Mitgliederverwaltung (Members)

Der Bereich **Mitglieder** ist das Herzstück von AssociaGo. Hier können Sie das vollständige Register aller Mitglieder verwalten.

## 2.1 Mitgliederliste
Die Haupttabelle zeigt:
- **Vor- und Nachname**
- **E-Mail**
- **Status**: (Aktiv, Abgelaufen, Suspendiert)
- **Mitgliedschaftsablauf**: Datum des Ablaufs der Anmeldung.
- **Rolle**: (Mitglied, Präsident, Sekretär, etc.)

### Filter und Suche
Verwenden Sie die Suchleiste oben, um ein Mitglied schnell zu finden, indem Sie Name, Nachname oder Mitgliedsnummer eingeben.

## 2.2 Neues Mitglied hinzufügen
Durch Klicken auf **"Mitglied hinzufügen"** öffnet sich ein detailliertes Formular, das in Abschnitte unterteilt ist:

### Persönliche Daten
- **Vor- und Nachname**: Obligatorisch.
- **Geburtsdatum**: Grundlegend für die Berechnung der Steuernummer (in Italien).
- **Geschlecht**: Männlich/Weiblich.
- **Geburtsort**: Gemeinde oder Ausland.
- **Katastercode**: (z.B. H501 für Rom). Notwendig für die automatische Berechnung der Steuernummer.

### Steuernummer
Das System enthält einen **automatischen Rechner**. Durch Eingabe der persönlichen Daten und Klicken auf "Berechnen" wird das Feld automatisch ausgefüllt. Es ist immer möglich, es manuell zu ändern.

### Kontakte und Adresse
- **E-Mail und Telefon**: Für die Kommunikation.
- **Vollständige Adresse**: Straße, Stadt, PLZ.

### Vereinsdaten
- **Mitgliedsnummer**: Manuell oder automatisch zugewiesen, wenn konfiguriert.
- **Rolle**: Definiert Berechtigungen und das soziale Amt.
- **Beitrittsdatum**: Datum des Eintritts in den Verein.

### Kontextuelle Zahlungsregistrierung
Unten im Formular befindet sich die Option **"Mitgliedsbeitrag registrieren"**.
Wenn ausgewählt:
1.  Werden die Felder für den Betrag (konfigurierbarer Standard) und die Zahlungsmethode aktiviert.
2.  Beim Speichern erstellt das System **automatisch** eine eingehende Transaktion in der Buchhaltung, die mit dem neuen Mitglied verknüpft ist.

## 2.3 Aktionen für das Mitglied
Für jede Zeile in der Tabelle stehen drei Schnellaktionen zur Verfügung:
1.  **Erneuern (Neu laden-Symbol)**: Verlängert die Gültigkeit der Karte um ein Jahr (oder den konfigurierten Zeitraum) und aktualisiert den Status auf "Aktiv".
2.  **Bearbeiten (Stift-Symbol)**: Öffnet das Formular zum Aktualisieren der Daten.
3.  **Löschen (Papierkorb-Symbol)**: Entfernt das Mitglied (irreversible Aktion, wird aber in den Protokollen aufbewahrt).

## 2.4 Drucken der Mitgliedskarte
Aus der Liste oder der Detailansicht können Sie das **PDF der Mitgliedskarte** herunterladen, bereit zum Drucken, komplett mit dem Vereinslogo und den Mitgliedsdaten.
