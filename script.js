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


// ========================================
// KARTE KLICKEN
// ========================================

map.on('click', function (event) {

    // Wenn gerade ein Spot bearbeitet wird,
    // keinen neuen erstellen
    if (activeSpot !== null) {

        return;

    }


    // Neuen Spot erstellen
    createSpot(event.latlng);

});


// ========================================
// SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    // Marker erstellen
    const marker = L.marker(
        position,
        {
            draggable: true
        }
    ).addTo(map);


    // Spot-Daten
    const spot = {

        marker: marker,

        name: '',

        description: '',

        category: 'Carshooting',

        saved: false

    };


    // Spot speichern
    spots.push(spot);


    // Aktiven Spot setzen
    activeSpot = spot;


    // ========================================
    // Marker-Klick
    // ========================================

    marker.on('click', function (event) {

        // Klick nicht an Karte weitergeben
        L.DomEvent.stopPropagation(event);


        // Gespeicherter Spot
        if (spot.saved) {

            showSpot(spot);

            return;

        }


        // Ungespeicherter Spot
        openEditor(spot);

    });


    // ========================================
    // Marker verschieben
    // ========================================

    marker.on('dragend', function () {

        // Nur bei einem neuen Spot
        // Popup nach dem Verschieben öffnen

        if (!spot.saved) {

            setTimeout(function () {

                openEditor(spot);

            }, 100);

        }

    });


    // ========================================
    // Editor direkt öffnen
    // ========================================

    openEditor(spot);

}


// ========================================
// EDITOR ÖFFNEN
// ========================================

function openEditor(spot) {

    const marker = spot.marker;


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
    // Popup-Listener VOR dem Öffnen
    // ========================================

    marker.once(
        'popupopen',
        function (event) {

            const popup =
                event.popup.getElement();


            if (!popup) {
                return;
            }


            // Popup-Klicks nicht an Karte weitergeben
            L.DomEvent.disableClickPropagation(
                popup
            );


            const nameInput =
                popup.querySelector(
                    '.spot-name'
                );


            const descriptionInput =
                popup.querySelector(
                    '.spot-description'
                );


            const categoryInput =
                popup.querySelector(
                    '.spot-category'
                );


            const saveButton =
                popup.querySelector(
                    '.spot-save'
                );


            if (!nameInput ||
                !descriptionInput ||
                !categoryInput ||
                !saveButton) {

                return;
            }


            // Aktuelle Kategorie setzen
            categoryInput.value =
                spot.category;


            // ====================================
            // SPEICHERN
            // ====================================

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


            nameInput.focus();

        }
    );


    // Popup setzen
    marker.bindPopup(html);


    // Popup öffnen
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

    // Name prüfen
    const name =
        nameInput.value.trim();


    if (name === '') {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        nameInput.focus();

        return;

    }


    // Daten speichern
    spot.name =
        name;


    spot.description =
        descriptionInput.value.trim();


    spot.category =
        categoryInput.value;


    spot.saved = true;


    // Marker fixieren
    spot.marker.dragging.disable();


    // Aktiven Spot freigeben
    activeSpot = null;


    // ========================================
    // Popup mit gespeicherten Daten anzeigen
    // ========================================

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
    // Popup setzen
    // ========================================

    marker.bindPopup(html);


    // ========================================
    // Popup öffnen
    // ========================================

    marker.openPopup();


    // ========================================
    // Bearbeiten-Button vorbereiten
    // ========================================

    marker.once(
        'popupopen',
        function (event) {

            const popup =
                event.popup.getElement();


            if (!popup) {
                return;
            }


            // Klicks im Popup nicht an Karte weitergeben
            L.DomEvent.disableClickPropagation(
                popup
            );


            const editButton =
                popup.querySelector(
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
