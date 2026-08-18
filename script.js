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
// Bearbeitungsformular erzeugen
// ========================================

function getEditorHtml() {

    return `
        <div class="marker-form">

            <label for="marker-name">
                Name
            </label>

            <input
                type="text"
                id="marker-name"
                value="${escapeHtml(markerData.name)}"
                placeholder="Name eingeben"
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

                <option value="Carshooting"
                    ${markerData.category === 'Carshooting' ? 'selected' : ''}>
                    Carshooting
                </option>

                <option value="Landscape"
                    ${markerData.category === 'Landscape' ? 'selected' : ''}>
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
}


// ========================================
// Marker bearbeiten
// ========================================

function openMarkerEditor() {

    marker.setPopupContent(
        getEditorHtml()
    );

    marker.openPopup();
}


// ========================================
// Popup wurde geöffnet
// ========================================

marker.on('popupopen', function () {

    const popupElement =
        document.querySelector('.marker-form');

    if (!popupElement) {
        return;
    }


    const saveButton =
        popupElement.querySelector('#save-marker');


    if (!saveButton) {
        return;
    }


    saveButton.onclick = function () {

        const nameInput =
            popupElement.querySelector('#marker-name');

        const descriptionInput =
            popupElement.querySelector('#marker-description');

        const categoryInput =
            popupElement.querySelector('#marker-category');


        // Daten speichern
        markerData.name =
            nameInput.value.trim();

        markerData.description =
            descriptionInput.value.trim();

        markerData.category =
            categoryInput.value;


        console.log('Marker gespeichert:');
        console.log(markerData);


        // Informationen anzeigen
        showMarkerInfo();
    };

});


// ========================================
// Gespeicherte Daten anzeigen
// ========================================

function showMarkerInfo() {

    const position =
        marker.getLatLng();


    const name =
        markerData.name || 'Unbenannter Marker';


    const description =
        markerData.description || 'Keine Beschreibung';


    const category =
        markerData.category || 'Keine Kategorie';


    const html = `
        <div class="marker-info">

            <h3>
                ${escapeHtml(name)}
            </h3>

            <p>
                <strong>Kategorie:</strong><br>
                ${escapeHtml(category)}
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


    marker.setPopupContent(html);
    marker.openPopup();


    // Bearbeiten-Button
    marker.once('popupopen', function () {

        const editButton =
            document.getElementById('edit-marker');


        if (editButton) {

            editButton.onclick = function () {
                openMarkerEditor();
            };

        }

    });
}


// ========================================
// Marker anklicken
// ========================================

marker.on('click', function () {

    openMarkerEditor();

});


// ========================================
// Marker verschieben
// ========================================

marker.on('dragend', function () {

    const position =
        marker.getLatLng();


    console.log(
        'Neue Position:',
        position.lat,
        position.lng
    );


    if (markerData.name !== '') {

        showMarkerInfo();

    }

});


// ========================================
// HTML absichern
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
}
