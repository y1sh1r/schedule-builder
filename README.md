# Wochenplaner

Ein persönlicher Wochenplaner für Alltag, Arbeit, Freizeit und Uni. Plane wiederkehrende Termine von Montag bis Sonntag und ergänze bei Bedarf deine eigenen Vorlesungen, Seminare oder Übungen. Der Planer startet mit einem leeren Kurskatalog, den du selbst befüllen kannst.

## Starten

Du brauchst Node.js ab Version 22 und npm. Öffne den Projektordner im Terminal und führe diese Befehle aus:

```sh
npm ci
npm start
```

Öffne anschließend [localhost:8080](http://localhost:8080) im Browser.

## Die Woche planen

- Über **Eigener Termin** legst du einen Termin mit Titel, Beschreibung und Farbe an. Du kannst mehrere Wochentage auswählen.
- Klicke einen bestehenden Termin an, um ihn zu bearbeiten oder zu löschen. Mit **Esc** schließt du den Dialog. Ein Rechtsklick auf einen Termin löscht ihn nach einer Rückfrage.
- Der Kalender reicht jeden Tag von 00:00 bis 24:00 Uhr. Gib **00:00** als Endzeit ein, wenn ein Termin um 24:00 Uhr endet. Ein Termin von 00:00 bis 00:00 ist nicht erlaubt. Für einen fast ganztägigen Termin nimm 00:00 bis 23:59. Teile Termine über Mitternacht auf zwei Tage auf.
- Über **Export** speicherst du die aktuelle Kalenderansicht als PDF oder JPG. Die Exportbibliotheken werden bei Bedarf aus dem Internet geladen.

## Eigene Kurse für die Uni hinzufügen

Trage deine Kurse selbst ein, zum Beispiel die Vorlesungen und Übungen aus deinem Semesterplan. Dieselbe Vorlage funktioniert auch für Sprachkurse, Sport oder andere regelmäßige Angebote.

1. Öffne die [Kursvorlage](data/kurse.example.json), speichere eine Kopie und fülle sie aus.
2. Klicke im Wochenplaner auf **Kurse importieren** und wähle deine JSON-Datei aus. Die Kursleiste öffnet sich automatisch.
3. Klicke auf die gewünschte Uhrzeit eines Kurses, um den Termin in deinen Wochenplan zu übernehmen.

So sieht ein ausgefüllter Eintrag aus:

```json
{
  "kurse": [
    {
      "id": "mathe-1",
      "name": "Mathematik I",
      "termine": [
        {
          "tag": "Montag",
          "start": "10:00",
          "ende": "11:30",
          "ort": "Raum B 204"
        }
      ]
    }
  ]
}
```

Gib jedem Kurs eine eigene, nicht leere `id`: Der Import lehnt Kataloge mit fehlenden oder doppelten IDs ab. Weitere Kurse kommen in die Liste `kurse`, weitere Uhrzeiten für denselben Kurs in dessen Liste `termine`. Verwende deutsche Wochentage und Uhrzeiten im Format `HH:MM`. `beschreibung` und `ort` sind optional.

Du kannst die Kurse auch direkt in [data/kurse.json](data/kurse.json) pflegen. Der Planer lädt diese Datei beim Öffnen, sofern im Browser kein importierter Katalog gespeichert ist.

## Lokale Speicherung

Deine Termine und der importierte Kurskatalog bleiben im aktuellen Browser gespeichert. Ein neuer Import ersetzt den importierten Katalog. Bereits in den Wochenplan übernommene Termine bleiben erhalten. Wenn du den Browser, das Gerät oder die Adresse wechselst, stehen die lokal gespeicherten Daten dort separat zur Verfügung.

## Tests

```sh
npm test
```

Die Tests prüfen unter anderem Zeitgrenzen, die Darstellung von Wochenendterminen und überlappenden Terminen, den Umgang mit defekten Browserdaten und die Validierung des Kurskatalogs.

## Mitwirkende

Das Projekt entstand im Sommersemester 2026 in der Veranstaltung **Webtechnologien**.

- Mohammad Reza Gholijani
- Mahdi Roustaei Chamkakaei
