# SCAPOR

SCAPOR ist eine webbasierte Karte, auf der Fotografen interessante Spots entdecken, markieren und bewerten können.

## Projektstruktur

- **index.html** – Kartenansicht und Einstiegspunkt
- **scripts/** – Karten-, Spot-, Editor-, Speicher- und Meldelogik
- **styles/** – Basis-, Karten-, Spot-, Seiten- und Navigationsdesign
- **welcome/** – Willkommensdialog und Welcome-Anzeige
- **loadingUnit/** – Ladebildschirm
- **contact/** – Kontaktseite
- **about/** – Informationen über SCAPOR
- **favicon/** – Favicons und Apple-Touch-Icon
- **vendor/** – lokal ausgelieferte Leaflet- und Supabase-Bibliotheken
- **privacy/** – Datenschutzerklärung mit vor Veröffentlichung auszufüllenden Pflichtangaben
- **imprint/** – Impressum mit vor Veröffentlichung auszufüllenden Pflichtangaben
- **terms/** – Nutzungs- und Community-Regeln
- **navigation.js** – gemeinsames Verhalten des Navigationsmenüs
- **spots.html** – HTML-Vorlagen für Spot-Editor und Spot-Details

Die JavaScript-Dateien werden in index.html bewusst in Abhängigkeitsreihenfolge geladen. scripts/app.js steht zuletzt und startet die Anwendung, nachdem alle benötigten Funktionen definiert wurden.

## Spamschutz für neue Spots

Neue Spots werden über die Supabase Edge Function `create-spot` geprüft und mit `active = false` gespeichert. Auf der Karte erscheinen ausschließlich Einträge mit `active = true`.

Vor der Nutzung:

1. Die Migration `supabase/migrations/20260825_spot_spam_protection.sql` im Supabase SQL Editor ausführen.
2. Für die Edge Function ein langes, zufälliges Secret namens `SPAM_HASH_SECRET` hinterlegen.
3. Die Funktion `supabase/functions/create-spot` zu Supabase deployen.
4. Eingereichte Spots im Supabase Table Editor prüfen und für die Veröffentlichung `active` auf `true` setzen.

## Kategorieauswahl

Beim Erstellen gibt es eine gemeinsame Dropdown-Auswahl mit entfernbaren Tags.
Mindestens eine und höchstens drei unterschiedliche Kategorien sind möglich.
Intern wird die erste ausgewählte Kategorie weiterhin als `category` gespeichert,
die übrigen (bis zu zwei) als `additional_categories`. Beim Entfernen der ersten
Kategorie rückt die nächste nach. Eine leere Auswahl verhindert das Speichern.
Karte und Spot-Liste filtern nach allen ausgewählten Kategorien; die Sortierung
nach Kategorie richtet sich weiterhin nach der ersten Kategorie.
Bestehende Spots mit nur einer Kategorie bleiben unverändert nutzbar.

Vor Veröffentlichung dieser Änderung in dieser Reihenfolge:

1. `supabase/migrations/20260828_spot_additional_categories.sql` einmal im Supabase SQL Editor ausführen.
2. Die aktualisierte Edge Function `supabase/functions/create-spot/index.ts` deployen.
3. Danach die aktualisierten Website-Dateien veröffentlichen und neu laden.

Die Datenbank speichert Zusatzkategorien in `additional_categories` (`text[]`).
Die Edge Function akzeptiert weiterhin ältere Anfragen ohne dieses Feld.
Ohne aktualisierte Edge Function würden Zusatzkategorien nicht gespeichert.
Die bestehende Benachrichtigungs-Mail erhält alle Kategorien als kommaseparierten Text.

Lokale Regressionstests ohne Datenbankzugriff: `node --test tests/spot-categories.test.cjs`.

## Datenschutz vor Veröffentlichung

- Alle markierten Platzhalter in `privacy/index.html` und `imprint/index.html` ausfüllen.
- Mit Hosting-, E-Mail- und Datenbankanbieter die tatsächlichen Speicherfristen und Vertragsbedingungen abgleichen.
- Mit Supabase einen Auftragsverarbeitungsvertrag abschließen und Projektregion dokumentieren.
- Google AdSense wurde entfernt. Werbung oder Tracking erst nach rechtlicher Prüfung und mit einem geeigneten Einwilligungsmechanismus wieder aktivieren.
- Die Supabase Row-Level-Security-Regeln und die serverseitige Löschroutine müssen separat im Supabase-Projekt geprüft werden.
- Betreiber: Maurice Hildenhagen. Eine ladungsfähige Anschrift ist vor Veröffentlichung noch einzutragen.
- Hosting: GitHub Pages; E-Mail: IONOS; Supabase-Region: EU Central 1 (Frankfurt).
- Kontakt- und Meldungs-E-Mails werden grundsätzlich sechs Monate nach Abschluss der Bearbeitung gelöscht.
- Einfache Spot-Meldungen sind anonym; formelle Rechtsmeldungen erfolgen über die Kontaktadresse.
