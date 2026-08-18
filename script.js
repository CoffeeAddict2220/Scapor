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
// Alle Spots
// ========================================

const spots = [];


// ========================================
// Aktuell neuer / ungespeicherter Spot
// ========================================

let activeSpot = null;


// ========================================
// Karte anklicken
// ========================================

map.on('click', function (event) {

    // ----------------------------------------
    // Wenn bereits ein neuer Spot existiert,
    // keinen weiteren erstellen
    // ----------------------------------------

    if (activeSpot !== null) {

        console.log(
            'Es ist bereits ein Spot in Bearbeitung.'
        );

        return;
    }


    // ----------------------------------------
    // Neuen Marker erstellen
    // ----------------------------------------

    const marker = L.marker(
        event.latlng,
        {
            draggable: true
        }
    ).addTo(map);


    // ----------------------------------------
    // Spot-Daten erstellen
    // ----------------------------------------

    const spot = {

        marker: marker,

        data: {
            name: '',
            description: '',
            category: 'Carshooting'
        },

        saved: false

    };


    // Zur Spot-Liste hinzufügen
    spots.push(spot);


    // Als aktiven Spot markieren
    activeSpot = spot;


    console.log(
        'Neuer Spot erstellt:',
        spot
    );


    // Marker-Klick einrichten
    setupMarkerClick(spot);


    // Formular öffnen
    openMarkerEditor(spot);

});


// ========================================
// Marker-Klick
// ========================================

function setupMarkerClick(spot) {

    spot.marker.on(
        'click',
        function () {

            // --------------------------------
            // Ungespeicherter Spot
            // --------------------------------

            if (!spot.saved) {

                openMarkerEditor(spot);

                return;
            }


            // --------------------------------
            // Gespeicherter Spot
            // --------------------------------

            showMarkerInfo(spot);

        }
    );

}


// ========================================
// Marker bearbeiten
// ========================================

function openMarkerEditor(spot) {

    const marker = spot.marker;
    const data = spot.data;


    const html = `
        <div class="marker-form">

            <label for="marker-name">
                Name
            </label>

            <input
                type="text"
                id="marker-name"
                placeholder="Name eingeben"
                value="${escapeHtml(data.name)}"
            >


            <label for="marker-description">
                Beschreibung
            </label>

            <textarea
                id="marker-description"
                placeholder="Beschreibung eingeben"
            >${escapeHtml(data.description)}</textarea>


            <label for="marker-category">
                Kategorie
            </label>

            <select id="marker-category">

                <option value="Carshooting">
                    Carshooting
                </option>

                <option value="Landscape">
                    Landscape
                </option>

            </select>


            <button
                type="button"
                id="save-marker"
            >
                Speichern
            </button>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();


    // Warten, bis das Popup vorhanden ist
    setTimeout(function () {

        const category =
            document.getElementById('marker-category');


        if (category) {

            category.value =
                data.category;

        }


        const saveButton =
            document.getElementById('save-marker');


        if (saveButton) {

            saveButton.onclick = function () {

                saveMarker(spot);

            };

        }

    }, 100);

}


// ========================================
// Spot speichern
// ========================================

function saveMarker(spot) {

    const nameInput =
        document.getElementById('marker-name');

    const descriptionInput =
        document.getElementById('marker-description');

    const categoryInput =
        document.getElementById('marker-category');


    // Formular prüfen
    if (!nameInput ||
        !descriptionInput ||
        !categoryInput) {

        console.error(
            'Formular konnte nicht gefunden werden.'
        );

        return;
    }


    // ----------------------------------------
    // Daten übernehmen
    // ----------------------------------------

    spot.data.name =
        nameInput.value.trim();

    spot.data.description =
        descriptionInput.value.trim();

    spot.data.category =
        categoryInput.value;


    // ----------------------------------------
    // Name erforderlich
    // ----------------------------------------

    if (spot.data.name === '') {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        return;
    }


    // ----------------------------------------
    // Spot speichern
    // ----------------------------------------

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


    // Informationen anzeigen
    showMarkerInfo(spot);

}


// ========================================
// Informationen eines Spots anzeigen
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
                id="edit-marker"
            >
                Bearbeiten
            </button>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();


    // Bearbeiten-Button
    setTimeout(function () {

        const editButton =
            document.getElementById('edit-marker');


        if (editButton) {

            editButton.onclick = function () {

                openMarkerEditor(spot);

            };

        }

    }, 100);

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
