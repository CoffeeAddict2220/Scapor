console.log("NEUE SCRIPT.JS WIRD GELADEN");


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
// KLICK AUF DIE KARTE
// ========================================

map.on('click', function (event) {

    console.log("KARTE WURDE ANGEKLICKT");


    // Nur einen neuen Marker gleichzeitig erlauben
    if (marker !== null) {

        console.log("Es existiert bereits ein Marker.");

        return;
    }


    // Position des Mausklicks
    const position = event.latlng;


    console.log(
        "Neue Marker-Position:",
        position.lat,
        position.lng
    );


    // ========================================
    // Marker erstellen
    // ========================================

    marker = L.marker(
        position,
        {
            draggable: true
        }
    ).addTo(map);


    // ========================================
    // Neue Daten
    // ========================================

    markerData = {
        name: '',
        description: '',
        category: 'Carshooting'
    };


    // ========================================
    // Formular anzeigen
    // ========================================

    openMarkerEditor();

});


// ========================================
// Formular zum Bearbeiten
// ========================================

function openMarkerEditor() {

    console.log("ÖFFNE MARKER-FORMULAR");


    if (marker === null) {
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
            >


            <label for="marker-description">
                Beschreibung
            </label>

            <textarea
                id="marker-description"
                placeholder="Beschreibung eingeben"
            ></textarea>


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


    // Kurz warten, bis Leaflet das Popup
    // in die Seite eingesetzt hat

    setTimeout(function () {

        const saveButton =
            document.getElementById('save-marker');


        if (!saveButton) {

            console.error(
                "SPEICHER-BUTTON NICHT GEFUNDEN"
            );

            return;
        }


        console.log(
            "SPEICHER-BUTTON GEFUNDEN"
        );


        saveButton.addEventListener(
            'click',
            saveMarker
        );

    }, 100);

}


// ========================================
// MARKER SPEICHERN
// ========================================

function saveMarker() {

    console.log(
        "=============================="
    );

    console.log(
        "SPEICHERN WURDE GEKLICKT"
    );


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
            "FORMULAR NICHT GEFUNDEN"
        );

        return;
    }


    // ========================================
    // Daten speichern
    // ========================================

    markerData.name =
        nameInput.value.trim();

    markerData.description =
        descriptionInput.value.trim();

    markerData.category =
        categoryInput.value;


    console.log(
        "Gespeicherte Daten:",
        markerData
    );


    // ========================================
    // Marker festsetzen
    // ========================================

    marker.dragging.disable();


    console.log(
        "MARKER WURDE FESTGESETZT"
    );


    // ========================================
    // Informationen anzeigen
    // ========================================

    showMarkerInfo();

}


// ========================================
// Gespeicherte Informationen anzeigen
// ========================================

function showMarkerInfo() {

    const position =
        marker.getLatLng();


    const html = `
        <div class="marker-info">

            <h3>
                ${escapeHtml(
                    markerData.name
                    || 'Unbenannter Marker'
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
                    markerData.description
                    || 'Keine Beschreibung'
                )}
            </p>

            <p>
                <strong>Position:</strong><br>
                ${position.lat.toFixed(6)},
                ${position.lng.toFixed(6)}
            </p>

        </div>
    `;


    marker
        .bindPopup(html)
        .openPopup();

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
