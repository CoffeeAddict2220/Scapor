// ========================================
// DATABASE CONNECTION
// ========================================

const SUPABASE_URL =
    "https://nsvpvhftaadgerxdoukw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_xJjyb2cuXbHV6ltaYwRF3w_WDNEknEH";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// KARTE
// ========================================

const map =
    L.map(
        'map',
        {
            zoomControl: false
        }
    ).setView(
        [51.1, 9.4],
        7
    );


// ========================================
// MARKER ICONS
// ========================================

function createActiveIcon() {

    return L.divIcon({

        className:
            'scapor-marker-wrapper',

        html: `
            <div class="scapor-marker active-marker">
                <div class="marker-dot"></div>
            </div>
        `,

        iconSize:
            [36, 36],

        iconAnchor:
            [18, 18],

        popupAnchor:
            [0, -18]

    });

}


function createSavedIcon() {

    return L.divIcon({

        className:
            'scapor-marker-wrapper',

        html: `
            <div class="scapor-marker saved-marker">
                <div class="marker-dot"></div>
            </div>
        `,

        iconSize:
            [36, 36],

        iconAnchor:
            [18, 18],

        popupAnchor:
            [0, -18]

    });

}


// ========================================
// KARTENLAYER
// ========================================


// ========================================
// NORMALE KARTENANSICHT
// ========================================

const streetMap =
    L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
                '&copy; OpenStreetMap contributors',

            maxZoom:
                19
        }
    );


// ========================================
// SATELLITENANSICHT
// ========================================

const satelliteMap =
    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution:
                'Tiles &copy; Esri',

            maxZoom:
                19,

            maxNativeZoom:
                19
        }
    );


// ========================================
// SATELLITEN-BESCHRIFTUNGEN
// ========================================
//
// Reiner Beschriftungs-Layer.
// Das Satellitenbild bleibt darunter sichtbar.
//
// Der Layer enthält OSM-basierte geografische
// Beschriftungen und wird ausschließlich über
// der Satellitenansicht eingeblendet.
//

map.createPane(
    'satelliteLabels'
);


map.getPane(
    'satelliteLabels'
).style.zIndex =
    650;


map.getPane(
    'satelliteLabels'
).style.pointerEvents =
    'none';


const satelliteLabels =
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
            subdomains:
                [
                    'a',
                    'b',
                    'c',
                    'd'
                ],

            maxZoom:
                20,

            maxNativeZoom:
                20,

            pane:
                'satelliteLabels',

            opacity:
                1,

            attribution:
                '&copy; OpenStreetMap contributors &copy; CARTO'
        }
    );


// ========================================
// STANDARDKARTE AKTIVIEREN
// ========================================

streetMap.addTo(
    map
);


// ========================================
// BASEMAP AUSWAHL
// ========================================

const baseMaps = {

    'Karte':
        streetMap,

    'Satellit':
        satelliteMap

};


// ========================================
// LAYER CONTROL
// ========================================

const layerControl =
    L.control.layers(
        baseMaps,
        null,
        {
            collapsed:
                true,

            position:
                'topright'
        }
    ).addTo(
        map
    );


// ========================================
// SATELLITEN-BESCHRIFTUNGEN
// AUTOMATISCH EIN-/AUSSCHALTEN
// ========================================

map.on(
    'baselayerchange',
    function (event) {

        // ========================================
        // SATELLIT AKTIV
        // ========================================

        if (
            event.name ===
            'Satellit'
        ) {

            if (
                !map.hasLayer(
                    satelliteLabels
                )
            ) {

                satelliteLabels.addTo(
                    map
                );

            }

        }


        // ========================================
        // NORMALE KARTE AKTIV
        // ========================================

        else {

            if (
                map.hasLayer(
                    satelliteLabels
                )
            ) {

                map.removeLayer(
                    satelliteLabels
                );

            }

        }

    }
);


// ========================================
// SPOTS
// ========================================

const spots = [];


// Aktuell bearbeiteter,
// noch nicht gespeicherter Spot

let activeSpot = null;


// ========================================
// SPOTS AUS SUPABASE LADEN
// ========================================

async function loadSpots() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from('spots')
                .select('*')
                .order(
                    'created_at',
                    {
                        ascending:
                            true
                    }
                );


        if (error) {

            console.error(
                'Fehler beim Laden der Spots:',
                error
            );

            return;

        }


        console.log(
            'Spots aus Supabase geladen:',
            data
        );


        data.forEach(
            function (row) {

                createSpotFromDatabase(
                    row
                );

            }
        );

    } catch (error) {

        console.error(
            'Unerwarteter Fehler beim Laden der Spots:',
            error
        );

    }

}


// ========================================
// SPOT AUS DATENBANK ERSTELLEN
// ========================================

function createSpotFromDatabase(row) {

    const latitude =
        Number(
            row.latitude
        );

    const longitude =
        Number(
            row.longitude
        );


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.error(
            'Ungültige Position für Spot:',
            row
        );

        return;

    }


    const position = [
        latitude,
        longitude
    ];


    const marker =
        L.marker(
            position,
            {
                draggable:
                    false,

                icon:
                    createSavedIcon(),

                autoPan:
                    true
            }
        ).addTo(map);


    const spot = {

        id:
            row.id,

        marker:
            marker,

        name:
            row.name || '',

        description:
            row.description || '',

        category:
            row.category ||
            'Architecture',

        rating:
            Number(
                row.rating || 0
            ),

        saved:
            true

    };


    spots.push(
        spot
    );


    // ========================================
    // MARKER KLICK
    // ========================================

    marker.on(
        'click',
        function (event) {

            L.DomEvent.stopPropagation(
                event
            );


            // Falls gerade ein neuer
            // ungespeicherter Spot bearbeitet wird,
            // diesen entfernen.

            if (
                activeSpot !== null &&
                activeSpot !== spot &&
                !activeSpot.saved
            ) {

                removeActiveSpot();

            }


            showSpot(
                spot
            );

        }
    );

}


// ========================================
// UNGESPEICHERTEN SPOT ENTFERNEN
// ========================================

function removeActiveSpot() {

    if (
        activeSpot === null
    ) {

        return;

    }


    if (
        activeSpot.saved
    ) {

        activeSpot =
            null;

        return;

    }


    // Popup schließen

    if (
        activeSpot.marker &&
        activeSpot.marker.getPopup()
    ) {

        activeSpot.marker.closePopup();

    }


    // Marker von Karte entfernen

    if (
        map.hasLayer(
            activeSpot.marker
        )
    ) {

        map.removeLayer(
            activeSpot.marker
        );

    }


    // Aus lokalem Array entfernen

    const index =
        spots.indexOf(
            activeSpot
        );


    if (
        index !== -1
    ) {

        spots.splice(
            index,
            1
        );

    }


    activeSpot =
        null;

}


// ========================================
// KLICK AUF DIE KARTE
// ========================================

map.on(
    'click',
    function (event) {

        // ========================================
        // VORHERIGEN UNGESPEICHERTEN SPOT ENTFERNEN
        // ========================================

        if (
            activeSpot !== null
        ) {

            removeActiveSpot();

        }


        // ========================================
        // NEUEN SPOT ERSTELLEN
        // ========================================

        createSpot(
            event.latlng
        );

    }
);


// ========================================
// SPOT ERSTELLEN
// ========================================

function createSpot(position) {

    const marker =
        L.marker(
            position,
            {
                draggable:
                    true,

                icon:
                    createActiveIcon(),

                autoPan:
                    true
            }
        ).addTo(map);


    const spot = {

        // Noch keine Datenbank-ID.
        // Die echte ID kommt von Supabase.

        id:
            null,

        marker:
            marker,

        name:
            '',

        description:
            '',

        category:
            'Architecture',

        rating:
            0,

        saved:
            false

    };


    spots.push(
        spot
    );


    // Ganz wichtig:
    // Dieser Spot ist jetzt der aktive Spot.

    activeSpot =
        spot;


    // ========================================
    // MARKER KLICK
    // ========================================

    marker.on(
        'click',
        function (event) {

            L.DomEvent.stopPropagation(
                event
            );


            if (
                spot.saved
            ) {

                showSpot(
                    spot
                );

            } else {

                openEditor(
                    spot
                );

            }

        }
    );


    // ========================================
    // MARKER VERSCHIEBEN
    // ========================================

    marker.on(
        'dragend',
        function () {

            if (
                spot.saved
            ) {

                return;

            }


            openEditor(
                spot
            );

        }
    );


    // ========================================
    // FORMULAR DIREKT ÖFFNEN
    // ========================================

    openEditor(
        spot
    );

}


// ========================================
// EDITOR
// ========================================

function openEditor(spot) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    const html = `
        <div class="marker-form">

            <label>
                Name
            </label>

            <input
                class="spot-name"
                type="text"
                placeholder="Name eingeben"
                value="${escapeHtml(
                    spot.name
                )}"
                autocomplete="off"
            >


            <label>
                Beschreibung
            </label>

            <textarea
                class="spot-description"
                placeholder="Beschreibung eingeben"
            >${escapeHtml(
                spot.description
            )}</textarea>


            <label>
                Kategorie
            </label>

            <select
                class="spot-category"
            >

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
    // POPUP BINDEN
    // ========================================

    spot.marker.unbindPopup();


    spot.marker.bindPopup(
        html,
        {
            closeButton:
                true,

            autoPan:
                true,

            autoPanPadding:
                [20, 80],

            maxWidth:
                340
        }
    );


    // ========================================
    // POPUP ÖFFNEN
    // ========================================

    spot.marker.once(
        'popupopen',
        function (event) {

            setupEditorPopup(
                spot,
                event.popup
            );

        }
    );


    spot.marker.openPopup();

}


// ========================================
// EDITOR POPUP EINRICHTEN
// ========================================

function setupEditorPopup(
    spot,
    popup
) {

    if (
        !popup
    ) {

        return;

    }


    const popupElement =
        popup.getElement();


    if (
        !popupElement
    ) {

        return;

    }


    const category =
        popupElement.querySelector(
            '.spot-category'
        );


    if (
        category
    ) {

        category.value =
            spot.category;

    }


    const saveButton =
        popupElement.querySelector(
            '.spot-save'
        );


    if (
        !saveButton
    ) {

        console.error(
            'Speichern-Button wurde nicht gefunden.'
        );

        return;

    }


    saveButton.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            saveSpot(
                spot
            );

        }
    );

}


// ========================================
// POPUP ERSTELLEN
// ========================================

function markerPopup(
    spot,
    html,
    onOpen
) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    spot.marker.unbindPopup();


    spot.marker.bindPopup(
        html,
        {
            closeButton:
                true,

            autoPan:
                true,

            autoPanPadding:
                [20, 80],

            maxWidth:
                340
        }
    );


    if (
        typeof onOpen ===
        'function'
    ) {

        spot.marker.once(
            'popupopen',
            function (event) {

                onOpen(
                    event.popup
                );

            }
        );

    }


    spot.marker.openPopup();

}


// ========================================
// SPOT SPEICHERN
// ========================================

async function saveSpot(spot) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    const popup =
        spot.marker.getPopup();


    if (
        !popup
    ) {

        return;

    }


    const popupElement =
        popup.getElement();


    if (
        !popupElement
    ) {

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


    if (
        !nameInput ||
        !descriptionInput ||
        !categoryInput
    ) {

        console.error(
            'Spot-Formular ist unvollständig.'
        );

        return;

    }


    // ========================================
    // NAME PRÜFEN
    // ========================================

    const name =
        nameInput.value.trim();


    if (
        name === ''
    ) {

        alert(
            'Bitte gib einen Namen für den Spot ein.'
        );

        nameInput.focus();

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
    // POSITION AUSLESEN
    // ========================================

    const position =
        spot.marker.getLatLng();


    if (
        !position
    ) {

        alert(
            'Die Position des Spots konnte nicht ermittelt werden.'
        );

        return;

    }


    // ========================================
    // BUTTON DEAKTIVIEREN
    // ========================================

    const saveButton =
        popupElement.querySelector(
            '.spot-save'
        );


    if (
        saveButton
    ) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            'Speichert ...';

    }


    // ========================================
    // IN SUPABASE SPEICHERN
    // ========================================

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from('spots')
                .insert({

                    name:
                        spot.name,

                    description:
                        spot.description,

                    category:
                        spot.category,

                    latitude:
                        position.lat,

                    longitude:
                        position.lng,

                    status:
                        'active'

                })
                .select()
                .single();


        // ========================================
        // FEHLER
        // ========================================

        if (
            error
        ) {

            console.error(
                'Fehler beim Speichern des Spots:',
                error
            );


            if (
                saveButton
            ) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    'Speichern';

            }


            alert(
                'Der Spot konnte nicht gespeichert werden.'
            );

            return;

        }


        if (
            !data
        ) {

            console.error(
                'Supabase hat keine Spot-Daten zurückgegeben.'
            );


            if (
                saveButton
            ) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    'Speichern';

            }


            alert(
                'Der Spot wurde gespeichert, aber die Antwort der Datenbank war leer.'
            );

            return;

        }


        // ========================================
        // SUPABASE-ID ÜBERNEHMEN
        // ========================================

        spot.id =
            data.id;


        // ========================================
        // SPOT ALS GESPEICHERT MARKIEREN
        // ========================================

        spot.saved =
            true;


        // ========================================
        // MARKER NICHT MEHR VERSCHIEBBAR
        // ========================================

        if (
            spot.marker.dragging
        ) {

            spot.marker.dragging.disable();

        }


        // ========================================
        // MARKER VON ROT AUF BLAU WECHSELN
        // ========================================

        spot.marker.setIcon(
            createSavedIcon()
        );


        // ========================================
        // AKTIVEN SPOT FREIGEBEN
        // ========================================

        if (
            activeSpot === spot
        ) {

            activeSpot =
                null;

        }


        // ========================================
        // GESPEICHERTEN SPOT ANZEIGEN
        // ========================================

        showSpot(
            spot
        );


    } catch (error) {

        console.error(
            'Unerwarteter Fehler beim Speichern:',
            error
        );


        if (
            saveButton
        ) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                'Speichern';

        }


        alert(
            'Beim Speichern des Spots ist ein unerwarteter Fehler aufgetreten.'
        );

    }

}


// ========================================
// GESPEICHERTEN SPOT ANZEIGEN
// ========================================

function showSpot(spot) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    const position =
        spot.marker.getLatLng();


    const html = `
        <div class="marker-info">

            <h3>
                ${escapeHtml(
                    spot.name ||
                    'Unbenannter Spot'
                )}
            </h3>


            <p>
                <strong>
                    Kategorie:
                </strong>
                <br>
                ${escapeHtml(
                    spot.category ||
                    'Keine Kategorie'
                )}
            </p>


            <p>
                <strong>
                    Beschreibung:
                </strong>
                <br>
                ${escapeHtml(
                    spot.description ||
                    'Keine Beschreibung'
                )}
            </p>


            <p>
                <strong>
                    Position:
                </strong>
                <br>
                ${position.lat.toFixed(6)},
                ${position.lng.toFixed(6)}
            </p>


            <div class="spot-rating">

                <strong>
                    Bewertung:
                </strong>


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
    // POPUP ÖFFNEN
    // ========================================

    markerPopup(
        spot,
        html,
        function (popup) {

            setupRating(
                spot,
                popup
            );

        }
    );

}


// ========================================
// BEWERTUNG EINRICHTEN
// ========================================

function setupRating(
    spot,
    popup
) {

    if (
        !popup
    ) {

        return;

    }


    const popupElement =
        popup.getElement();


    if (
        !popupElement
    ) {

        return;

    }


    const ratingButtons =
        popupElement.querySelectorAll(
            '.rating-stars button'
        );


    ratingButtons.forEach(
        function (button) {

            const rating =
                Number(
                    button.dataset.rating
                );


            // ========================================
            // VORHANDENE BEWERTUNG
            // ========================================

            if (
                rating <=
                spot.rating
            ) {

                button.textContent =
                    '★';

            } else {

                button.textContent =
                    '☆';

            }


            // ========================================
            // BEWERTUNG AUSWÄHLEN
            // ========================================

            button.addEventListener(
                'click',
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    spot.rating =
                        rating;


                    updateRatingStars(
                        ratingButtons,
                        spot.rating
                    );

                }
            );

        }
    );

}


// ========================================
// BEWERTUNGSSTERNE AKTUALISIEREN
// ========================================

function updateRatingStars(
    buttons,
    rating
) {

    buttons.forEach(
        function (button) {

            const starRating =
                Number(
                    button.dataset.rating
                );


            if (
                starRating <=
                rating
            ) {

                button.textContent =
                    '★';

            } else {

                button.textContent =
                    '☆';

            }

        }
    );

}


// ========================================
// HTML ABSICHERN
// ========================================

function escapeHtml(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return '';

    }


    const div =
        document.createElement(
            'div'
        );


    div.textContent =
        String(text);


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

if (
    welcomeOverlay
) {

    const welcomeShown =
        sessionStorage.getItem(
            'scaporWelcomeShown'
        );


    if (
        welcomeShown ===
        'true'
    ) {

        welcomeOverlay.style.display =
            'none';

    }

}


// ========================================
// WILLKOMMENS-POPUP SCHLIESSEN
// ========================================

function closeWelcomePopup() {

    if (
        !welcomeOverlay
    ) {

        return;

    }


    welcomeOverlay.style.display =
        'none';


    sessionStorage.setItem(
        'scaporWelcomeShown',
        'true'
    );

}


// ========================================
// START-BUTTON
// ========================================

if (
    welcomeStart
) {

    welcomeStart.addEventListener(
        'click',
        closeWelcomePopup
    );

}


// ========================================
// X-BUTTON
// ========================================

if (
    welcomeClose
) {

    welcomeClose.addEventListener(
        'click',
        closeWelcomePopup
    );

}


// ========================================
// SUPABASE STARTEN
// ========================================

loadSpots();
