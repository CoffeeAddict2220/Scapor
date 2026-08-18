// ========================================
// KARTE ERSTELLEN
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
// SPOTS
// ========================================

const spots = [];


// Aktuell ungespeicherter Spot
let activeSpot = null;


// Verhindert neuen Spot direkt nach dem Speichern
let ignoreNextMapClick = false;


// ========================================
// KARTE KLICKEN
// ========================================

map.on('click', function (event) {

    console.log('Karte geklickt');


    // Klick direkt nach dem Speichern ignorieren
    if (ignoreNextMapClick) {

        ignoreNextMapClick = false;

        return;
    }


    // Wenn bereits ein neuer Spot bearbeitet wird,
    // keinen weiteren erstellen
    if (activeSpot !== null) {

        console.log(
            'Es ist bereits ein Spot in Bearbeitung.'
        );

        return;
    }


    // Neuen Spot erstellen
    createSpot(event.latlng);

});


// ========================================
// SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    console.log(
        'Neuer Spot wird erstellt'
    );


    // ----------------------------------------
    // Marker
    // ----------------------------------------

    const marker = L.marker(
        position,
        {
            draggable: true
        }
    ).addTo(map);


    // ----------------------------------------
    // Spot-Daten
    // ----------------------------------------

    const spot = {

        marker: marker,

        name: '',

        description: '',

        category: 'Carshooting',

        saved: false

    };


    // Spot speichern
    spots.push(spot);


    // Als aktiven Spot markieren
    activeSpot = spot;


    // ----------------------------------------
    // Marker-Klick
    // ----------------------------------------

    marker.on(
        'click',
        function (event) {

            // Kartenklick verhindern
            L.DomEvent.stopPropagation(event);


            if (spot.saved) {

                showSpot(spot);

            } else {

                openEditor(spot);

            }

        }
    );


    // ----------------------------------------
    // Marker verschieben
    // ----------------------------------------

    marker.on(
        'dragend',
        function () {

            console.log(
                'Marker wurde verschoben'
            );


            // Bei einem ungespeicherten Spot
            // Popup wieder öffnen

            if (!spot.saved) {

                setTimeout(
                    function () {

                        openEditor(spot);

                    },
                    50
                );

            }

        }
    );


    // ----------------------------------------
    // Editor öffnen
    // ----------------------------------------

    openEditor(spot);

}


// ========================================
// EDITOR ÖFFNEN
// ========================================

function openEditor(spot) {

    const marker = spot.marker;


    console.log(
        'Editor öffnen'
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

                <option value="Carshooting">
                    Carshooting
                </option>

                <option value="Landscape">
                    Landscape
                </option>

            </select>


            <button
                type="button"
                class="spot-save"
            >
                Speichern
            </button>

        </div>
    `;


    // ========================================
    // WICHTIG:
    // Erst Listener registrieren
    // ========================================

    marker.once(
        'popupopen',
        function (event) {

            const popupElement =
                event.popup.getElement();


            if (!popupElement) {

                console.error(
                    'Popup-Element nicht gefunden'
                );

                return;
            }


            // Klicks innerhalb des Popups
            // nicht an die Karte weitergeben
            L.DomEvent.disableClickPropagation(
                popupElement
            );


            // ------------------------------------
            // Formularfelder
            // ------------------------------------

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


            const saveButton =
                popupElement.querySelector(
                    '.spot-save'
                );


            if (!nameInput ||
                !descriptionInput ||
                !categoryInput ||
                !saveButton) {

                console.error(
                    'Formular konnte nicht gefunden werden'
                );

                return;
            }


            // Kategorie setzen
            categoryInput.value =
                spot.category;


            // ------------------------------------
            // Speichern
            // ------------------------------------

            saveButton.addEventListener(
                'click',
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    saveSpot(
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


    // ========================================
    // ERST JETZT Popup setzen
    // ========================================

    marker.bindPopup(
        html
    );


    // ========================================
    // UND JETZT Popup öffnen
    // ========================================

    marker.openPopup();

}


// ========================================
// SPOT SPEICHERN
// ========================================

function saveSpot(
    spot,
    nameInput,
    descriptionInput,
    categoryInput
) {

    console.log(
        'Speichern geklickt'
    );


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


    // ----------------------------------------
    // Nächsten Kartenklick nicht als neuen
    // Spot interpretieren
    // ----------------------------------------

    ignoreNextMapClick = true;


    setTimeout(
        function () {

            ignoreNextMapClick = false;

        },
        200
    );


    console.log(
        'Spot gespeichert:',
        spot
    );


    // Gespeicherte Informationen anzeigen
    showSpot(spot);

}


// ========================================
// GESPEICHERTEN SPOT ANZEIGEN
// ========================================

function showSpot(spot) {

    const marker = spot.marker;


    const position =
        marker.getLatLng();


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
                class="spot-edit"
            >
                Bearbeiten
            </button>

        </div>
    `;


    // ========================================
    // WICHTIG:
    // Listener VOR dem Öffnen registrieren
    // ========================================

    marker.once(
        'popupopen',
        function (event) {

            const popupElement =
                event.popup.getElement();


            if (!popupElement) {
                return;
            }


            // Popup-Klicks nicht an Karte weitergeben
            L.DomEvent.disableClickPropagation(
                popupElement
            );


            const editButton =
                popupElement.querySelector(
                    '.spot-edit'
                );


            if (!editButton) {
                return;
            }


            editButton.addEventListener(
                'click',
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    openEditor(spot);

                }
            );

        }
    );


    // Popup setzen
    marker.bindPopup(
        html
    );


    // Popup öffnen
    marker.openPopup();

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
