// ========================================
// DATABASE CONNECTION
// ========================================

const SUPABASE_URL = "https://nsvpvhftaadgerxdoukw.supabase.co";
const SUPABASE_KEY = "sb_publishable_xJjyb2cuXbHV6ltaYwRF3w_WDNEknEH";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ========================================
// KARTE
// ========================================

const map = L.map('map', {
    zoomControl: false
}).setView(
    [51.1, -349.4],
    7
);


// ========================================
// MARKER FARBEN
// ========================================

function createActiveIcon() {

    return L.divIcon({

        className: 'scapor-marker-wrapper',

        html: `
            <div class="scapor-marker active-marker">
                <div class="marker-dot"></div>
            </div>
        `,

        iconSize: [36, 36],

        iconAnchor: [18, 18],

        popupAnchor: [0, -18]

    });

}


function createSavedIcon() {

    return L.divIcon({

        className: 'scapor-marker-wrapper',

        html: `
            <div class="scapor-marker saved-marker">
                <div class="marker-dot"></div>
            </div>
        `,

        iconSize: [36, 36],

        iconAnchor: [18, 18],

        popupAnchor: [0, -18]

    });

}


// ========================================
// KARTENLAYER
// ========================================

// Normale Kartenansicht
const streetMap = L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
);


// Satellitenansicht
const satelliteMap = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri'
    }
);


// Standardmäßig normale Karte anzeigen
streetMap.addTo(map);


// ========================================
// KARTEN-AUSWAHL
// ========================================

const baseMaps = {

    'Karte': streetMap,

    'Satellit': satelliteMap

};


L.control.layers(
    baseMaps,
    null,
    {
        collapsed: true,
        position: 'topright'
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

    // Wenn bereits ein neuer Spot bearbeitet wird,
    // diesen entfernen
    if (activeSpot !== null) {

        // Nur ungespeicherte Spots dürfen
        // auf diese Weise entfernt werden
        if (!activeSpot.saved) {

            map.removeLayer(
                activeSpot.marker
            );


            const index =
                spots.indexOf(activeSpot);


            if (index !== -1) {

                spots.splice(
                    index,
                    1
                );

            }

        }


        // Aktiven Spot zurücksetzen
        activeSpot = null;

    }


    // Neuen Spot erstellen
    createSpot(event.latlng);

});


// ========================================
// SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    const marker = L.marker(
        position,
        {
            draggable: true,
            icon: createActiveIcon(),
            autoPan: true
        }
    ).addTo(map);


    const spot = {

        id: nextSpotId++,

        marker: marker,

        name: '',

        description: '',

        category: 'Architecture',

        rating: 0,

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

                <option value="Architecture">
                    Architecture
                </option>

                <option value="Astro">
                    Astro
                </option>

                <option value="Carshooting">
                    Carshooting
                </option>

                <option value="Carspotting">
                    Carspotting
                </option>

                <option value="Landscape">
                    Landscape
                </option>

                <option value="Nature">
                    Nature
                </option>

                <option value="Planespotting">
                    Planespotting
                </option>

                <option value="Portrait">
                    Portrait
                </option>

                <option value="Trainspotting">
                    Trainspotting
                </option>

                <option value="Wildlife">
                    Wildlife
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


    // ========================================
    // POPUP ERSTELLEN
    // ========================================

    markerPopup(
        spot,
        html
    );


    // ========================================
    // FORMULAR VORBEREITEN
    // ========================================

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


    // ========================================
    // SPEICHERN
    // ========================================

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


    // ========================================
    // NAME PRÜFEN
    // ========================================

    const name =
        nameInput.value.trim();


    if (name === '') {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        return;

    }


    // ========================================
    // DATEN ÜBERNEHMEN
    // ========================================

    spot.name =
        name;


    spot.description =
        descriptionInput.value.trim();


    spot.category =
        categoryInput.value;


    // ========================================
    // SPOT SPEICHERN
    // ========================================

    spot.saved = true;


    // Marker fixieren
    spot.marker.dragging.disable();


    // Marker von Rot auf Blau wechseln
    spot.marker.setIcon(
        createSavedIcon()
    );


    // Aktiven Spot freigeben
    activeSpot = null;


    // Gespeicherten Spot anzeigen
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


            <div class="spot-rating">

                <strong>Bewertung:</strong>

                <div class="rating-stars">

                    <button
                        type="button"
                        data-rating="1"
                        aria-label="1 von 5 Sternen"
                    >
                        ☆
                    </button>

                    <button
                        type="button"
                        data-rating="2"
                        aria-label="2 von 5 Sternen"
                    >
                        ☆
                    </button>

                    <button
                        type="button"
                        data-rating="3"
                        aria-label="3 von 5 Sternen"
                    >
                        ☆
                    </button>

                    <button
                        type="button"
                        data-rating="4"
                        aria-label="4 von 5 Sternen"
                    >
                        ☆
                    </button>

                    <button
                        type="button"
                        data-rating="5"
                        aria-label="5 von 5 Sternen"
                    >
                        ☆
                    </button>

                </div>

            </div>

        </div>
    `;


    // ========================================
    // POPUP BINDEN
    // ========================================

    markerPopup(
        spot,
        html
    );


    // ========================================
    // POPUP ELEMENT
    // ========================================

    const popupElement =
        spot.marker.getPopup().getElement();


    if (!popupElement) {
        return;
    }


    // ========================================
    // BEWERTUNG
    // ========================================

    const ratingButtons =
        popupElement.querySelectorAll(
            '.rating-stars button'
        );


    ratingButtons.forEach(function (button) {

        const rating =
            Number(
                button.dataset.rating
            );


        // Bereits vorhandene Bewertung anzeigen
        if (rating <= spot.rating) {

            button.textContent =
                '★';

        }


        // Bewertung auswählen
        button.onclick =
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                spot.rating =
                    rating;


                // Sterne aktualisieren
                ratingButtons.forEach(
                    function (starButton) {

                        const starRating =
                            Number(
                                starButton.dataset.rating
                            );


                        if (
                            starRating <=
                            spot.rating
                        ) {

                            starButton.textContent =
                                '★';

                        } else {

                            starButton.textContent =
                                '☆';

                        }

                    }
                );

            };

    });

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


// ========================================
// WILLKOMMENS-POPUP
// ========================================

const welcomeOverlay =
    document.getElementById(
        'welcome-overlay'
    );


const welcomeStart =
    document.getElementById(
        'welcome-start'
    );


const welcomeClose =
    document.getElementById(
        'welcome-close'
    );


// ========================================
// PRÜFEN, OB POPUP SCHON GEZEIGT WURDE
// ========================================

if (welcomeOverlay) {

    const welcomeShown =
        sessionStorage.getItem(
            'scaporWelcomeShown'
        );


    if (welcomeShown === 'true') {

        welcomeOverlay.style.display =
            'none';

    }

}


// ========================================
// POPUP SCHLIESSEN
// ========================================

function closeWelcomePopup() {

    if (!welcomeOverlay) {
        return;
    }


    // Popup ausblenden
    welcomeOverlay.style.display =
        'none';


    // Für diesen Besuch merken
    sessionStorage.setItem(
        'scaporWelcomeShown',
        'true'
    );

}


// ========================================
// START-BUTTON
// ========================================

if (welcomeStart) {

    welcomeStart.addEventListener(
        'click',
        closeWelcomePopup
    );

}


// ========================================
// X-BUTTON
// ========================================

if (welcomeClose) {

    welcomeClose.addEventListener(
        'click',
        closeWelcomePopup
    );

}
