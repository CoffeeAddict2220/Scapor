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

// Alle erstellten Spots
const spots = [];


// Der aktuell neu erstellte,
// noch nicht gespeicherte Spot
let activeSpot = null;


// Verhindert einen Kartenklick direkt
// nach dem Speichern eines Spots
let ignoreNextMapClick = false;


// ========================================
// KLICK AUF DIE KARTE
// ========================================

map.on('click', function (event) {

    console.log('Karte geklickt');


    // ----------------------------------------
    // Kartenklick nach dem Speichern ignorieren
    // ----------------------------------------

    if (ignoreNextMapClick) {

        ignoreNextMapClick = false;

        return;
    }


    // ----------------------------------------
    // Ist bereits ein neuer Spot aktiv?
    // ----------------------------------------

    if (activeSpot !== null) {

        console.log(
            'Es befindet sich bereits ein Spot in Bearbeitung.'
        );

        return;
    }


    // ----------------------------------------
    // Neuen Spot erstellen
    // ----------------------------------------

    createSpot(event.latlng);

});


// ========================================
// NEUEN SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    console.log(
        'Neuer Spot wird erstellt:',
        position
    );


    // ----------------------------------------
    // Marker erstellen
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


    // Spot zur Liste hinzufügen
    spots.push(spot);


    // Spot als aktuell aktiv markieren
    activeSpot = spot;


    // ----------------------------------------
    // Marker-Klick
    // ----------------------------------------

    marker.on(
        'click',
        function (event) {

            // Kartenklick verhindern
            L.DomEvent.stopPropagation(event);


            // Gespeicherter Spot
            if (spot.saved) {

                showSpot(spot);

                return;
            }


            // Noch nicht gespeicherter Spot
            openEditor(spot);

        }
    );


    // ----------------------------------------
    // Marker verschoben
    // ----------------------------------------

    marker.on(
        'dragend',
        function () {

            console.log(
                'Spot wurde verschoben'
            );


            // Wenn der Spot noch nicht gespeichert ist,
            // Popup nach dem Verschieben erneut öffnen

            if (!spot.saved) {

                setTimeout(
                    function () {

                        openEditor(spot);

                    },
                    100
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
        'Editor wird geöffnet'
    );


    // ----------------------------------------
    // Formular
    // ----------------------------------------

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


    // Popup-Inhalt setzen
    marker.bindPopup(html);


    // Popup öffnen
    marker.openPopup();


    // ----------------------------------------
    // Warten, bis Popup vorhanden ist
    // ----------------------------------------

    marker.once(
        'popupopen',
        function (event) {

            const popupElement =
                event.popup.getElement();


            if (!popupElement) {

                console.error(
                    'Popup konnte nicht gefunden werden.'
                );

                return;
            }


            // ------------------------------------
            // Klicks innerhalb des Popups
            // nicht an die Karte weitergeben
            // ------------------------------------

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


            // Prüfen
            if (!nameInput ||
                !descriptionInput ||
                !categoryInput ||
                !saveButton) {

                console.error(
                    'Formularfelder konnten nicht gefunden werden.'
                );

                return;
            }


            // Aktuelle Kategorie anzeigen
            categoryInput.value =
                spot.category;


            // ------------------------------------
            // Speichern
            // ------------------------------------

            saveButton.addEventListener(
                'click',
                function (event) {

                    // Klick nicht weitergeben
                    L.DomEvent.stopPropagation(
                        event
                    );


                    event.preventDefault();


                    saveSpot(
                        spot,
                        nameInput,
                        descriptionInput,
                        categoryInput
                    );

                }
            );


            // Cursor in Name setzen
            nameInput.focus();

        }
    );

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
        'Speichern wurde geklickt'
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
    // Marker festsetzen
    // ----------------------------------------

    if (spot.marker.dragging) {

        spot.marker.dragging.disable();

    }


    // ----------------------------------------
    // Aktiven Spot freigeben
    // ----------------------------------------

    if (activeSpot === spot) {

        activeSpot = null;

    }


    // ----------------------------------------
    // Verhindern, dass der Speichern-Klick
    // einen neuen Spot erzeugt
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


    // ----------------------------------------
    // Gespeicherte Informationen anzeigen
    // ----------------------------------------

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


    // Popup setzen
    marker.bindPopup(html);


    // Popup öffnen
    marker.openPopup();


    // ----------------------------------------
    // Popup-Event
    // ----------------------------------------

    marker.once(
        'popupopen',
        function (event) {

            const popupElement =
                event.popup.getElement();


            if (!popupElement) {
                return;
            }


            // Klicks innerhalb des Popups
            // nicht an Karte weitergeben
            L.DomEvent.disableClickPropagation(
                popupElement
            );


            // Bearbeiten-Button
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

                    L.DomEvent.stopPropagation(
                        event
                    );


                    event.preventDefault();


                    openEditor(spot);

                }
            );

        }
    );

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
