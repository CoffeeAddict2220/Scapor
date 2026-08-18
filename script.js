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
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// ========================================
// Marker-Daten
// ========================================

let markerData = {
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

    const popupContent = `
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

                <option
                    value="Carshooting"
                    ${markerData.category === 'Carshooting' ? 'selected' : ''}
                >
                    Carshooting
                </option>

                <option
                    value="Landscape"
                    ${markerData.category === 'Landscape' ? 'selected' : ''}
                >
                    Landscape
                </option>

            </select>

            <button
                id="save-marker"
                type="button"
            >
                Speichern
            </button>

        </div>
    `;


    // Popup-Inhalt setzen
    marker.bindPopup(popupContent);


    // ========================================
    // WICHTIG:
    // Event registrieren, BEVOR Popup geöffnet wird
    // ========================================

    marker.once('popupopen', function () {

        const nameInput =
            document.getElementById('marker-name');

        const descriptionInput =
            document.getElementById('marker-description');

        const categoryInput =
            document.getElementById('marker-category');

        const saveButton =
            document.getElementById('save-marker');


        // Cursor direkt ins Namensfeld setzen
        if (nameInput) {
            nameInput.focus();
        }


        // ========================================
        // Speichern
        // ========================================

        if (saveButton) {

            saveButton.addEventListener(
                'click',
                function () {

                    // Daten aus Formular übernehmen
                    markerData.name =
                        nameInput.value.trim();

                    markerData.description =
                        descriptionInput.value.trim();

                    markerData.category =
                        categoryInput.value;


                    // Popup mit gespeicherten Daten anzeigen
                    showMarkerInfo();
                }
            );
        }

    });


    // Erst JETZT Popup öffnen
    marker.openPopup();
}


// ========================================
// Gespeicherte Marker-Daten anzeigen
// ========================================

function showMarkerInfo() {

    const position = marker.getLatLng();

    const name =
        markerData.name || 'Unbenannter Marker';

    const description =
        markerData.description || 'Keine Beschreibung';

    const category =
        markerData.category || 'Keine Kategorie';


    const popupContent = `
        <div class="marker-info">

            <h3>
                ${escapeHtml(name)}
            </h3>

            <p>
                <strong>Kategorie:</strong><br>
                <span class="marker-category">
                    ${escapeHtml(category)}
                </span>
            </p>

            <p>
                <strong>Beschreibung:</strong><br>
                ${escapeHtml(description)}
            </p>

            <p>
                <strong>Position:</strong><br>
                ${position.lat.toFixed(6)},
                ${position.lng.toFixed(6)}
            </p>

            <button
                id="edit-marker"
                type="button"
            >
                Bearbeiten
            </button>

        </div>
    `;


    marker.bindPopup(popupContent);
    marker.openPopup();


    // Warten, bis das Popup geöffnet ist
    marker.once('popupopen', function () {

        const editButton =
            document.getElementById('edit-marker');


        if (editButton) {

            editButton.addEventListener(
                'click',
                function () {

                    openMarkerEditor();

                }
            );
        }

    });
}


// ========================================
// Klick auf Marker
// ========================================

marker.on(
    'click',
    function () {

        openMarkerEditor();

    }
);


// ========================================
// Marker verschoben
// ========================================

marker.on(
    'dragend',
    function (event) {

        const position =
            event.target.getLatLng();


        console.log(
            'Neue Position:',
            position.lat,
            position.lng
        );


        // Falls der Marker bereits einen Namen hat,
        // die aktualisierte Position anzeigen
        if (markerData.name !== '') {

            showMarkerInfo();

        }

    }
);


// ========================================
// HTML-Sonderzeichen absichern
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
}
