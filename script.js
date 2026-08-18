// ========================================
// KARTE
// ========================================

const map = L.map('map', {
    zoomControl: false
}).setView(
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

let activeSpot = null;

let nextSpotId = 1;


// ========================================
// KLICK AUF DIE KARTE
// ========================================

map.on('click', function (event) {

    // Wenn gerade ein neuer Spot bearbeitet wird,
    // keinen weiteren erstellen
    if (activeSpot !== null) {
        return;
    }

    createSpot(event.latlng);

});


// ========================================
// SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    const marker = L.marker(
        position,
        {
            draggable: true
        }
    ).addTo(map);


    const spot = {

        id: nextSpotId++,

        marker: marker,

        name: '',

        description: '',

        category: 'Carshooting',

        saved: false

    };


    spots.push(spot);

    activeSpot = spot;


    // ========================================
    // MARKER KLICK
    // ========================================

    marker.on('click', function (event) {

        L.DomEvent.stopPropagation(event);


        if (spot.saved) {

            showSpot(spot);

        } else {

            openEditor(spot);

        }

    });


    // ========================================
    // MARKER VERSCHIEBEN
    // ========================================

    marker.on('dragend', function () {

        if (!spot.saved) {

            setTimeout(function () {

                openEditor(spot);

            }, 100);

        }

    });


    // Formular öffnen
    openEditor(spot);

}


// ========================================
// EDITOR
// ========================================

function openEditor(spot) {

    const html = `
        <div class="marker-form">

            <label>Name</label>

            <input
                class="spot-name"
                type="text"
                placeholder="Name eingeben"
                value="${escapeHtml(spot.name)}"
            >

            <label>Beschreibung</label>

            <textarea
                class="spot-description"
                placeholder="Beschreibung eingeben"
            >${escapeHtml(spot.description)}</textarea>

            <label>Kategorie</label>

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


    // ----------------------------------------
    // Popup erstellen
    // ----------------------------------------

    markerPopup(
        spot,
        html
    );


    // ----------------------------------------
    // Formular vorbereiten
    // ----------------------------------------

    const popupElement =
        spot.marker.getPopup().getElement();


    if (!popupElement) {
        return;
    }


    const category =
        popupElement.querySelector(
            '.spot-category'
        );


    category.value =
        spot.category;


    const saveButton =
        popupElement.querySelector(
            '.spot-save'
        );


    // ----------------------------------------
    // Speichern
    // ----------------------------------------

    saveButton.onclick = function (event) {

        event.preventDefault();

        event.stopPropagation();


        saveSpot(spot);

    };

}


// ========================================
// POPUP ERSTELLEN
// ========================================

function markerPopup(spot, html) {

    // Vorheriges Popup entfernen
    spot.marker.unbindPopup();


    // Neues Popup binden
    spot.marker.bindPopup(
        html
    );


    // Popup öffnen
    spot.marker.openPopup();

}


// ========================================
// SPOT SPEICHERN
// ========================================

function saveSpot(spot) {

    const popup =
        spot.marker.getPopup();


    if (!popup) {
        return;
    }


    const popupElement =
        popup.getElement();


    if (!popupElement) {
        return;
    }


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


    // Name prüfen
    const name =
        nameInput.value.trim();


    if (name === '') {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        return;

    }


    // Daten übernehmen
    spot.name =
        name;


    spot.description =
        descriptionInput.value.trim();


    spot.category =
        categoryInput.value;


    // Spot speichern
    spot.saved = true;


    // Marker fixieren
    spot.marker.dragging.disable();


    // Aktiven Spot freigeben
    activeSpot = null;


    // Info anzeigen
    showSpot(spot);

}


// ========================================
// GESPEICHERTEN SPOT ANZEIGEN
// ========================================

function showSpot(spot) {

    const position =
        spot.marker.getLatLng();


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


    // Popup binden
    markerPopup(
        spot,
        html
    );


    // Bearbeiten-Button
    const popupElement =
        spot.marker.getPopup().getElement();


    if (!popupElement) {
        return;
    }


    const editButton =
        popupElement.querySelector(
            '.spot-edit'
        );


    if (editButton) {

        editButton.onclick =
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                openEditor(spot);

            };

    }

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
