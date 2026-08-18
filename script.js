console.log("SCRIPT.JS GELADEN");


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

// Hier werden alle erstellten Spots gespeichert
const spots = [];


// ========================================
// Karte anklicken
// ========================================

map.on('click', function (event) {

    console.log("Karte geklickt");


    // ========================================
    // Neuen Spot erstellen
    // ========================================

    const marker = L.marker(
        event.latlng,
        {
            draggable: true
        }
    ).addTo(map);


    // Daten des neuen Spots
    const spotData = {

        name: '',

        description: '',

        category: 'Carshooting',

        saved: false

    };


    // Marker und Daten miteinander verbinden
    const spot = {

        marker: marker,

        data: spotData

    };


    // Spot zur Liste hinzufügen
    spots.push(spot);


    console.log(
        "Neuer Spot erstellt",
        spot
    );


    // Formular öffnen
    openMarkerEditor(spot);

});


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


    // Kategorie setzen und Button verbinden
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

    console.log("Spot wird gespeichert");


    const data = spot.data;

    const marker = spot.marker;


    const nameInput =
        document.getElementById('marker-name');

    const descriptionInput =
        document.getElementById('marker-description');

    const categoryInput =
        document.getElementById('marker-category');


    if (!nameInput ||
        !descriptionInput ||
        !categoryInput) {

        console.error(
            "Formular konnte nicht gefunden werden."
        );

        return;

    }


    // ========================================
    // Daten übernehmen
    // ========================================

    data.name =
        nameInput.value.trim();

    data.description =
        descriptionInput.value.trim();

    data.category =
        categoryInput.value;


    // Name erforderlich
    if (data.name === '') {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        return;

    }


    // ========================================
    // Spot als gespeichert markieren
    // ========================================

    data.saved = true;


    // ========================================
    // Marker festsetzen
    // ========================================

    marker.dragging.disable();


    console.log(
        "Spot gespeichert:",
        spot
    );


    // ========================================
    // Informationen anzeigen
    // ========================================

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
                class="edit-marker-button"
            >
                Bearbeiten
            </button>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();


    // Bearbeiten-Button verbinden
    setTimeout(function () {

        const editButton =
            document.querySelector(
                '.edit-marker-button'
            );


        if (editButton) {

            editButton.onclick = function () {

                openMarkerEditor(spot);

            };

        }

    }, 100);

}


// ========================================
// Marker anklicken
// ========================================

// Wir verwenden einen zentralen Listener,
// damit jeder neu erstellte Marker funktioniert.

function setupMarkerClick(spot) {

    spot.marker.on(
        'click',
        function () {

            showMarkerInfo(spot);

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
