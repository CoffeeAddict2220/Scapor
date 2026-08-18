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
// Marker-Daten
// ========================================

const markerData = {
    name: '',
    description: '',
    category: 'Carshooting'
};


// ========================================
// Marker erstellen
// ========================================

const marker = L.marker(
    [51.7, 10.0],
    {
        draggable: true
    }
).addTo(map);


// ========================================
// Marker bearbeiten
// ========================================

function openMarkerEditor() {

    const html = `
        <div class="marker-form">

            <label>Name</label>

            <input
                type="text"
                id="marker-name"
                placeholder="Name eingeben"
                value="${escapeHtml(markerData.name)}"
            >


            <label>Beschreibung</label>

            <textarea
                id="marker-description"
                placeholder="Beschreibung eingeben"
            >${escapeHtml(markerData.description)}</textarea>


            <label>Kategorie</label>

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
                onclick="saveMarker()"
            >
                Speichern
            </button>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();


    // Bereits gespeicherte Kategorie auswählen
    setTimeout(function () {

        const category =
            document.getElementById('marker-category');

        if (category) {

            category.value =
                markerData.category;

        }

    }, 50);
}


// ========================================
// MARKER SPEICHERN
// ========================================

function saveMarker() {

    console.log('Speichern wurde geklickt');


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
            'Formularfelder wurden nicht gefunden!'
        );

        return;
    }


    // Daten übernehmen
    markerData.name =
        nameInput.value.trim();

    markerData.description =
        descriptionInput.value.trim();

    markerData.category =
        categoryInput.value;


    console.log(
        'Marker gespeichert:',
        markerData
    );


    // Informationen anzeigen
    showMarkerInfo();
}


// ========================================
// MARKER-DATEN ANZEIGEN
// ========================================

function showMarkerInfo() {

    const position =
        marker.getLatLng();


    const html = `
        <div class="marker-info">

            <h3>
                ${escapeHtml(
                    markerData.name ||
                    'Unbenannter Marker'
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
                onclick="openMarkerEditor()"
            >
                Bearbeiten
            </button>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();
}


// ========================================
// Marker anklicken
// ========================================

marker.on(
    'click',
    function () {

        openMarkerEditor();

    }
);


// ========================================
// Marker verschieben
// ========================================

marker.on(
    'dragend',
    function () {

        const position =
            marker.getLatLng();


        console.log(
            'Neue Position:',
            position.lat,
            position.lng
        );


        // Wenn bereits ein Name vorhanden ist,
        // Daten nach dem Verschieben anzeigen
        if (markerData.name !== '') {

            showMarkerInfo();

        }

    }
);


// ========================================
// HTML absichern
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
}
