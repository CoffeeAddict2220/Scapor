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
// Aktueller Marker
// ========================================

let marker = null;


// ========================================
// Marker-Daten
// ========================================

let markerData = {
    name: '',
    description: '',
    category: 'Carshooting'
};


// ========================================
// Karte anklicken
// ========================================

map.on('click', function (event) {

    // Wenn bereits ein neuer, ungespeicherter
    // Marker existiert, keinen weiteren erzeugen
    if (marker !== null) {
        return;
    }


    // Position des Klicks
    const position = event.latlng;


    // ========================================
    // Neuen Marker erstellen
    // ========================================

    marker = L.marker(
        position,
        {
            draggable: true
        }
    ).addTo(map);


    // Neue Daten zurücksetzen
    markerData = {
        name: '',
        description: '',
        category: 'Carshooting'
    };


    // Editor öffnen
    openMarkerEditor();

});


// ========================================
// Marker bearbeiten
// ========================================

function openMarkerEditor() {

    if (!marker) {
        return;
    }


    const html = `
        <div class="marker-form">

            <label for="marker-name">
                Name
            </label>

            <input
                type="text"
                id="marker-name"
                placeholder="Name eingeben"
                value="${escapeHtml(markerData.name)}"
            >


            <label for="marker-description">
                Beschreibung
            </label>

            <textarea
                id="marker-description"
                placeholder="Beschreibung eingeben"
            >${escapeHtml(markerData.description)}</textarea>


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


    // Kategorie setzen
    setTimeout(function () {

        const category =
            document.getElementById('marker-category');

        if (category) {

            category.value =
                markerData.category;

        }


        // ========================================
        // Speichern-Button
        // ========================================

        const saveButton =
            document.getElementById('save-marker');


        if (saveButton) {

            saveButton.onclick = function () {

                saveMarker();

            };

        }

    }, 50);
}


// ========================================
// Marker speichern
// ========================================

function saveMarker() {

    if (!marker) {
        return;
    }


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
            'Marker-Formular konnte nicht gefunden werden.'
        );

        return;
    }


    // ========================================
    // Daten übernehmen
    // ========================================

    markerData.name =
        nameInput.value.trim();

    markerData.description =
        descriptionInput.value.trim();

    markerData.category =
        categoryInput.value;


    // Name erforderlich
    if (markerData.name === '') {

        alert(
            'Bitte gib einen Namen für den Marker ein.'
        );

        return;
    }


    // ========================================
    // Marker FESTSETZEN
    // ========================================

    marker.dragging.disable();


    // ========================================
    // Informationen anzeigen
    // ========================================

    showMarkerInfo();


    console.log(
        'Marker gespeichert:',
        markerData
    );

}


// ========================================
// Marker-Informationen anzeigen
// ========================================

function showMarkerInfo() {

    if (!marker) {
        return;
    }


    const position =
        marker.getLatLng();


    const html = `
        <div class="marker-info">

            <h3>
                ${escapeHtml(
                    markerData.name
                )}
            </h3>


            <p>
                <strong>Kategorie:</strong><br>
                ${escapeHtml(
                    markerData.category
                )}
            </p>


            <p>
                <strong>Beschreibung:</strong><br>
                ${escapeHtml(
                    markerData.description ||
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

                openMarkerEditor();

            };

        }

    }, 50);

}


// ========================================
// Gespeicherten Marker anklicken
// ========================================

function setupMarkerClick() {

    if (!marker) {
        return;
    }


    marker.on('click', function () {

        showMarkerInfo();

    });

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
