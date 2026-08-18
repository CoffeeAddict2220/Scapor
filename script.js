// ========================================
// Karte erstellen
// ========================================

const map = L.map('map').setView(
    [51.7, 10.0],
    10
);


// ========================================
// OpenStreetMap
// ========================================

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// ========================================
// Spots
// ========================================

const spots = [];


// ========================================
// Aktuell ungespeicherter Spot
// ========================================

let activeSpot = null;


// Verhindert, dass der Speichern-Klick
// direkt einen neuen Spot erzeugt
let ignoreNextMapClick = false;


// ========================================
// Klick auf die Karte
// ========================================

map.on('click', function (event) {

    // ----------------------------------------
    // Kartenklick nach Speichern ignorieren
    // ----------------------------------------

    if (ignoreNextMapClick) {

        ignoreNextMapClick = false;

        return;
    }


    // ----------------------------------------
    // Gibt es bereits einen unfertigen Spot?
    // ----------------------------------------

    if (activeSpot !== null) {

        console.log(
            'Es ist bereits ein Spot in Bearbeitung.'
        );

        return;
    }


    // ----------------------------------------
    // Neuen Spot erstellen
    // ----------------------------------------

    createSpot(event.latlng);

});


// ========================================
// Neuen Spot erstellen
// ========================================

function createSpot(position) {

    console.log(
        'Neuer Spot wird erstellt:',
        position
    );


    const marker = L.marker(
        position,
        {
            draggable: true
        }
    ).addTo(map);


    const spot = {

        marker: marker,

        data: {

            name: '',

            description: '',

            category: 'Carshooting'

        },

        saved: false

    };


    // Spot speichern
    spots.push(spot);


    // Dieser Spot ist jetzt in Bearbeitung
    activeSpot = spot;


    // Klick auf den Marker
    setupMarkerClick(spot);


    // Formular öffnen
    openMarkerEditor(spot);

}


// ========================================
// Marker-Klick
// ========================================

function setupMarkerClick(spot) {

    spot.marker.on('click', function (event) {

        // Kartenklick verhindern
        L.DomEvent.stopPropagation(event);


        // ------------------------------------
        // Ungespeicherter Spot
        // ------------------------------------

        if (!spot.saved) {

            openMarkerEditor(spot);

            return;
        }


        // ------------------------------------
        // Gespeicherter Spot
        // ------------------------------------

        showMarkerInfo(spot);

    });

}


// ========================================
// Marker-Editor öffnen
// ========================================

function openMarkerEditor(spot) {

    const marker = spot.marker;
    const data = spot.data;


    const html = `
        <div class="marker-form">

            <label>
                Name
            </label>

            <input
                class="marker-name"
                type="text"
                placeholder="Name eingeben"
                value="${escapeHtml(data.name)}"
            >


            <label>
                Beschreibung
            </label>

            <textarea
                class="marker-description"
                placeholder="Beschreibung eingeben"
            >${escapeHtml(data.description)}</textarea>


            <label>
                Kategorie
            </label>

            <select class="marker-category">

                <option value="Carshooting">
                    Carshooting
                </option>

                <option value="Landscape">
                    Landscape
                </option>

            </select>


            <button
                type="button"
                class="save-marker"
            >
                Speichern
            </button>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();


    // ========================================
    // Popup öffnen
    // ========================================

    marker.once(
        'popupopen',
        function (event) {

            const popup =
                event.popup.getElement();


            if (!popup) {
                return;
            }


            // Klicks innerhalb des Popups dürfen
            // nicht als Kartenklick interpretiert werden
            L.DomEvent.disableClickPropagation(
                popup
            );


            const nameInput =
                popup.querySelector(
                    '.marker-name'
                );


            const descriptionInput =
                popup.querySelector(
                    '.marker-description'
                );


            const categoryInput =
                popup.querySelector(
                    '.marker-category'
                );


            const saveButton =
                popup.querySelector(
                    '.save-marker'
                );


            // Kategorie setzen
            categoryInput.value =
                data.category;


            // ====================================
            // Speichern
            // ====================================

            saveButton.addEventListener(
                'click',
                function (event) {

                    // Klick nicht weitergeben
                    L.DomEvent.stopPropagation(
                        event
                    );


                    saveMarker(
                        spot,
                        nameInput,
                        descriptionInput,
                        categoryInput
                    );

                }
            );


            // Cursor ins Namensfeld
            nameInput.focus();

        }
    );

}


// ========================================
// Spot speichern
// ========================================

function saveMarker(
    spot,
    nameInput,
    descriptionInput,
    categoryInput
) {

    console.log(
        'Spot wird gespeichert'
    );


    // ========================================
    // Daten übernehmen
    // ========================================

    spot.data.name =
        nameInput.value.trim();


    spot.data.description =
        descriptionInput.value.trim();


    spot.data.category =
        categoryInput.value;


    // ========================================
    // Name erforderlich
    // ========================================

    if (spot.data.name === '') {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        return;

    }


    // ========================================
    // Spot speichern
    // ========================================

    spot.saved = true;


    // ========================================
    // Marker fixieren
    // ========================================

    spot.marker.dragging.disable();


    // ========================================
    // Verhindern, dass der aktuelle
    // Speichern-Klick einen neuen Spot erzeugt
    // ========================================

    ignoreNextMapClick = true;


    setTimeout(
        function () {

            ignoreNextMapClick = false;

        },
        100
    );


    // ========================================
    // Aktiven Spot freigeben
    // ========================================

    if (activeSpot === spot) {

        activeSpot = null;

    }


    console.log(
        'Spot gespeichert:',
        spot
    );


    // ========================================
    // Informationen anzeigen
    // ========================================

    showMarkerInfo(spot);

}


// ========================================
// Gespeicherten Spot anzeigen
// ========================================

function showMarkerInfo(spot) {

    const marker = spot.marker;
    const data = spot.data;


    const position =
        marker.getLatLng();


    const html = `
        <div class="marker-info">

            <h3>
                ${escapeHtml(data.name)}
            </h3>


            <p>
                <strong>Kategorie:</strong><br>
                ${escapeHtml(data.category)}
            </p>


            <p>
                <strong>Beschreibung:</strong><br>
                ${escapeHtml(
                    data.description ||
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
                class="edit-marker"
            >
                Bearbeiten
            </button>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();


    // ========================================
    // Popup öffnen
    // ========================================

    marker.once(
        'popupopen',
        function (event) {

            const popup =
                event.popup.getElement();


            if (!popup) {
                return;
            }


            // Klicks im Popup nicht an Karte
            // weitergeben
            L.DomEvent.disableClickPropagation(
                popup
            );


            const editButton =
                popup.querySelector(
                    '.edit-marker'
                );


            if (editButton) {

                editButton.addEventListener(
                    'click',
                    function (event) {

                        L.DomEvent.stopPropagation(
                            event
                        );


                        openMarkerEditor(
                            spot
                        );

                    }
                );

            }

        }
    );

}


// ========================================
// HTML absichern
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement('div');

    div.textContent = text;

    return div.innerHTML;

}
