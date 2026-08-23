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
- **navigation.js** – gemeinsames Verhalten des Navigationsmenüs
- **spots.html** – HTML-Vorlagen für Spot-Editor und Spot-Details

Die JavaScript-Dateien werden in index.html bewusst in Abhängigkeitsreihenfolge geladen. scripts/app.js steht zuletzt und startet die Anwendung, nachdem alle benötigten Funktionen definiert wurden.
