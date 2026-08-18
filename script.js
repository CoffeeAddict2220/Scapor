// ========================================
// KARTE
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


// Verhindert neuen Spot direkt nach Speichern
let blockMapClick = false;


// ========================================
// KARTE KLICKEN
// ========================================

map.on('click', function (event) {

    console.log('MAP CLICK');


    // Klick nach Speichern ignorieren
    if (blockMapClick) {

        blockMapClick = false;

        return;
    }


    // Gibt es bereits einen unfertigen Spot?
    if (activeSpot !== null) {

        console.log(
            'Noch ein Spot wird gerade bearbeitet.'
        );

        return;
    }


    createSpot(event.latlng);

});


// ========================================
// SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    console.log(
        'SPOT ERSTELLT'
    );


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


    // Marker-Klick
    marker.on(
        'click',
        function (event) {

            // Kartenklick verhindern
            L.DomEvent.stopPropagation(event);


            if (spot.saved) {

                showSpot(spot);

            } else {

                openEditor(spot);

            }

        }
    );


    // Editor öffnen
    openEditor(spot);

}


// ========================================
// EDITOR
// ========================================

function openEditor(spot) {

    console.log(
        'EDITOR ÖFFNEN'
    );


    const html = `
        <div class="marker-form">

            <label>Name</label>

            <input
                id="spot-name"
                type="text"
                placeholder="Name"
                value="${escapeHtml(spot.name)}"
            >


            <label>Beschreibung</label>

            <textarea
                id="spot-description"
                placeholder="Beschreibung"
            >${escapeHtml(spot.description)}</textarea>


            <label>Kategorie</label>

            <select id="spot-category">

                <option value="Carshooting">
                    Carshooting
                </option>

                <option value="Landscape">
                    Landscape
                </option>

            </select>


            <button
                id="spot-save"
                type="button"
            >
                Speichern
            </button>

        </div>
    `;


    markerPopup(
        spot,
        html
    );


    // ----------------------------------------
    // Warten bis Popup im DOM ist
    // ----------------------------------------

    setTimeout(function () {

        const name =
            document.getElementById('spot-name');

        const description =
            document.getElementById('spot-description');

        const category =
            document.getElementById('spot-category');

        const save =
            document.getElementById('spot-save');


        if (!name ||
            !description ||
            !category ||
            !save) {

            console.error(
                'FORMULAR NICHT GEFUNDEN'
            );

            return;
        }


        // Werte setzen
        category.value =
            spot.category;


        // ------------------------------------
        // SPEICHERN
        // ------------------------------------

        save.onclick = function (event) {

            // Klick stoppen
            event.preventDefault();

            event.stopPropagation();


            console.log(
                'SPEICHERN GEKLICKT'
            );


            // Daten übernehmen
            spot.name =
                name.value.trim();

            spot.description =
                description.value.trim();

            spot.category =
                category.value;


            // Name erforderlich
            if (spot.name === '') {

                alert(
                    'Bitte gib einen Namen ein.'
                );

                return;
            }


            // Spot speichern
            spot.saved = true;


            // Marker fixieren
            spot.marker.dragging.disable();


            // Aktiven Spot freigeben
            if (activeSpot === spot) {

                activeSpot = null;

            }


            // Kartenklick blockieren
            blockMapClick = true;


            console.log(
                'SPOT GESPEICHERT',
                spot
            );


            // Daten anzeigen
            showSpot(spot);

        };


        name.focus();

    }, 100);

}


// ========================================
// POPUP SETZEN
// ========================================

function markerPopup(
    spot,
    html
) {

    spot.marker
        .bindPopup(
            html
        )
        .openPopup();

}


// ========================================
// SPOT ANZEIGEN
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
                id="spot-edit"
                type="button"
            >
                Bearbeiten
            </button>

        </div>
    `;


    markerPopup(
        spot,
        html
    );


    setTimeout(function () {

        const edit =
            document.getElementById('spot-edit');


        if (edit) {

            edit.onclick = function (event) {

                event.preventDefault();

                event.stopPropagation();

                openEditor(spot);

            };

        }

    }, 100);

}


// ========================================
// HTML ABSICHERN
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement('div');

    div.textContent = text;

    return div.innerHTML;

}
