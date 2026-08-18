// ========================================
// Karte erstellen
// ========================================

const map = L.map('map').setView(
    [51.7, 10.0],
    10
);


// ========================================
// OpenStreetMap hinzufügen
// ========================================

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(map);


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
// Marker-Daten
// ========================================

let markerName = '';


// ========================================
// Popup zum Bearbeiten öffnen
// ========================================

function openMarkerEditor() {

    const popupContent = `
        <div class="marker-form">

            <label for="marker-name">
                Name:
            </label>

            <input
                type="text"
                id="marker-name"
                placeholder="Name eingeben"
                value="${markerName}"
            >

            <button
                id="save-marker"
                type="button"
            >
                Speichern
            </button>

        </div>
    `;

    marker
        .bindPopup(popupContent)
        .openPopup();


    // Warten, bis das Popup tatsächlich
    // im DOM vorhanden ist
    marker.once('popupopen', function () {

        const input =
            document.getElementById('marker-name');

        const button =
            document.getElementById('save-marker');


        // Eingabefeld automatisch auswählen
        input.focus();


        // Name speichern
        button.addEventListener('click', function () {

            markerName = input.value.trim();


            if (markerName === '') {
                markerName = 'Unbenannter Marker';
            }


            // Name dauerhaft am Marker-Popup anzeigen
            marker
                .bindPopup(
                    `<strong>${markerName}</strong>`
                )
                .openPopup();
        });
    });
}


// ========================================
// Klick auf Marker
// ========================================

marker.on('click', function () {

    openMarkerEditor();

});


// ========================================
// Marker verschoben
// ========================================

marker.on('dragend', function (event) {

    const position =
        event.target.getLatLng();

    console.log(
        'Neue Position:',
        position.lat,
        position.lng
    );

});
