// ========================================
// KARTE
// ========================================

const map = L.map('map').setView(
    [51.7, 10.0],
    10
);


// ========================================
// OPENSTREETMAP
// ========================================

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// ========================================
// SPOT-VERWALTUNG
// ========================================

const spots = [];

let activeSpot = null;

let nextSpotId = 1;


// ========================================
// KLICK AUF DIE KARTE
// ========================================

map.on('click', function (event) {

    console.log('Karte geklickt');


    // Solange ein neuer Spot noch nicht
    // gespeichert wurde, keinen weiteren erstellen
    if (activeSpot !== null) {

        console.log(
            'Es ist bereits ein Spot in Bearbeitung.'
        );

        return;
    }


    createSpot(event.latlng);

});


// ========================================
// NEUEN SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    console.log(
        'Neuer Spot wird erstellt'
    );


    // Marker erstellen
    const marker = L.marker(
        position,
        {
            draggable: true
        }
    ).addTo(map);


    // Spot erstellen
    const spot = {

        id: nextSpotId++,

        marker: marker,

        name: '',

        description: '',

        category: 'Carshooting',

        saved: false

    };


    // Zur Liste hinzufügen
    spots.push(spot);


    // Aktiver Spot
    activeSpot = spot;


    // ========================================
    // MARKER KLICK
    // ========================================

    marker.on('click', function (event) {

        // Klick nicht an Karte weitergeben
        L.DomEvent.stopPropagation(event);


        if (spot.saved) {

            showSpot(spot);

        } else {

            openEditor(spot);

        }

    });


    // ========================================
    // MARKER VERSCHIEBEN
    // ========================================

    marker.on('dragend', function () {

        console.log(
            'Spot wurde verschoben'
        );


        // Solange der Spot nicht gespeichert ist,
        // Formular nach dem Verschieben wieder öffnen

        if (!spot.saved) {

            setTimeout(function () {

                openEditor(spot);

            }, 100);

        }

    });


    // Formular direkt öffnen
    openEditor(spot);

}


// ========================================
// EDITOR
// ========================================

function openEditor(spot) {

    console.log(
        'Editor für Spot ' + spot.id
    );


    const html = `

        <div class="marker-form">

            <label>
                Name
            </label>

            <input
                class="spot-name"
                type="text"
                placeholder="Name eingeben"
                value="${escapeHtml(spot.name)}"
            >


            <label>
                Beschreibung
            </label>

            <textarea
                class="spot-description"
                placeholder="Beschreibung eingeben"
            >${escapeHtml(spot.description)}</textarea>


            <label>
                Kategorie
            </label>

            <select class="spot-category">

                <option
                    value="Carshooting"
                    ${spot.category === 'Carshooting' ? 'selected' : ''}
                >
                    Carshooting
                </option>

                <option
                    value="Landscape"
                    ${spot.category === 'Landscape' ? 'selected' : ''}
                >
                    Landscape
                </option>

            </select>


            <button
                type="button"
                onclick="saveSpot(${spot.id})"
            >
                Speichern
            </button>

        </div>

    `;


    // Popup-Inhalt setzen
    spot.marker.setPopupContent(html);


    // Popup öffnen
    spot.marker.openPopup();


    // Popup-Klicks nicht an Karte weitergeben
    setTimeout(function () {

        const popup =
            spot.marker.getPopup();


        if (!popup) {
            return;
        }


        const popupElement =
            popup.getElement();


        if (popupElement) {

            L.DomEvent.disableClickPropagation(
                popupElement
            );

        }


        // Fokus auf Name
        const input =
            popupElement?.querySelector(
                '.spot-name'
            );


        if (input) {
            input.focus();
        }

    }, 50);

}


// ========================================
// SPOT SPEICHERN
// ========================================

function saveSpot(spotId) {

    console.log(
        'Speichern für Spot:',
        spotId
    );


    // Spot suchen
    const spot =
        spots.find(function (item) {

            return item.id === spotId;

        });


    if (!spot) {

        console.error(
            'Spot nicht gefunden!'
        );

        return;

    }


    // Popup holen
    const popup =
        spot.marker.getPopup();


    if (!popup) {

        console.error(
            'Popup nicht gefunden!'
        );

        return;

    }


    const popupElement =
        popup.getElement();


    if (!popupElement) {

        console.error(
            'Popup-Element nicht gefunden!'
        );

        return;

    }


    // ----------------------------------------
    // Formularfelder
    // ----------------------------------------

    const nameInput =
        popupElement.querySelector(
            '.spot-name'
        );


    const descriptionInput =
        popupElement.querySelector(
            '.spot-description'
        );


    const categoryInput =
        popupElement.querySelector(
            '.spot-category'
        );


    if (!nameInput ||
        !descriptionInput ||
        !categoryInput) {

        console.error(
            'Formularfelder nicht gefunden!'
        );

        return;

    }


    // ----------------------------------------
    // Name prüfen
    // ----------------------------------------

    const name =
        nameInput.value.trim();


    if (name === '') {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        nameInput.focus();

        return;

    }


    // ----------------------------------------
    // Daten speichern
    // ----------------------------------------

    spot.name =
        name;


    spot.description =
        descriptionInput.value.trim();


    spot.category =
        categoryInput.value;


    spot.saved = true;


    // ----------------------------------------
    // Marker fixieren
    // ----------------------------------------

    spot.marker.dragging.disable();


    // ----------------------------------------
    // Aktiven Spot freigeben
    // ----------------------------------------

    if (activeSpot === spot) {

        activeSpot = null;

    }


    console.log(
        'Spot gespeichert:',
        spot
    );


    // ----------------------------------------
    // Info-Popup anzeigen
    // ----------------------------------------

    showSpot(spot);

}


// ========================================
// GESPEICHERTEN SPOT ANZEIGEN
// ========================================

function showSpot(spot) {

    console.log(
        'Zeige Spot:',
        spot.id
    );


    const position =
        spot.marker.getLatLng();


    const html = `

        <div class="marker-info">

            <h3>
                ${escapeHtml(spot.name)}
            </h3>


            <p>
                <strong>Kategorie:</strong><br>
                ${escapeHtml(spot.category)}
            </p>


            <p>
                <strong>Beschreibung:</strong><br>
                ${escapeHtml(
                    spot.description ||
                    'Keine Beschreibung'
                )}
            </p>


            <p>
                <strong>Position:</strong><br>
                ${position.lat.toFixed(6)},
                ${position.lng.toFixed(6)}
            </p>


            <button
                type="button"
                onclick="editSpot(${spot.id})"
            >
                Bearbeiten
            </button>

        </div>

    `;


    // ----------------------------------------
    // Popup-Inhalt setzen
    // ----------------------------------------

    spot.marker.setPopupContent(html);


    // ----------------------------------------
    // Popup öffnen
    // ----------------------------------------

    spot.marker.openPopup();


    // Popup-Klicks nicht an Karte weitergeben
    setTimeout(function () {

        const popup =
            spot.marker.getPopup();


        if (!popup) {
            return;
        }


        const popupElement =
            popup.getElement();


        if (popupElement) {

            L.DomEvent.disableClickPropagation(
                popupElement
            );

        }

    }, 50);

}


// ========================================
// GESPEICHERTEN SPOT BEARBEITEN
// ========================================

function editSpot(spotId) {

    console.log(
        'Bearbeite Spot:',
        spotId
    );


    const spot =
        spots.find(function (item) {

            return item.id === spotId;

        });


    if (!spot) {
        return;
    }


    // Wichtig:
    // Der Spot bleibt gespeichert und fixiert.
    // Nur die Daten werden bearbeitet.

    openEditor(spot);

}


// ========================================
// HTML ABSICHERN
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement('div');


    div.textContent =
        text;


    return div.innerHTML;

}
