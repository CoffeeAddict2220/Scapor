// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    'https://nsvpvhftaadgerxdoukw.supabase.co';

const SUPABASE_ANON_KEY =
    'sb_publishable_xJjyb2cuXbHV6ltaYwRF3w_WDNEknEH';


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// KARTE
// ========================================

const map =
    L.map(
        'map',
        {
            zoomControl:
                false,

            worldCopyJump:
                false,

            maxBounds:
                [
                    [
                        -85,
                        -180
                    ],
                    [
                        85,
                        180
                    ]
                ],

            maxBoundsViscosity:
                1.0
        }
    ).setView(
        [
            51.1657,
            10.4515
        ],
        6
    );


// ========================================
// ICONS
// ========================================

function createActiveIcon() {

    return L.divIcon({

        className:
            'scapor-marker-wrapper',

        html:
            `
            <div class="scapor-marker active-marker">
                <div class="marker-dot"></div>
            </div>
            `,

        iconSize:
            [
                30,
                30
            ],

        iconAnchor:
            [
                15,
                15
            ],

        popupAnchor:
            [
                0,
                -18
            ]

    });

}


function createSavedIcon() {

    return L.divIcon({

        className:
            'scapor-marker-wrapper',

        html:
            `
            <div class="scapor-marker saved-marker">
                <div class="marker-dot"></div>
            </div>
            `,

        iconSize:
            [
                30,
                30
            ],

        iconAnchor:
            [
                15,
                15
            ],

        popupAnchor:
            [
                0,
                -18
            ]

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

            noWrap:
                true
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

            noWrap:
                true
        }
    );


// ========================================
// SATELLITEN-BESCHRIFTUNGEN
// ========================================

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

            noWrap:
                true,

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
// EIGENEN STANDORT ANZEIGEN
// ========================================

let userLocationMarker =
    null;


let locationControlButton =
    null;


function showUserLocation() {

    if (
        userLocationMarker &&
        map.hasLayer(
            userLocationMarker
        )
    ) {

        map.removeLayer(
            userLocationMarker
        );


        if (
            locationControlButton
        ) {

            locationControlButton.setAttribute(
                'aria-pressed',
                'false'
            );

        }

        return;

    }


    if (
        !navigator.geolocation
    ) {

        alert(
            'Dein Browser unterstützt keine Standortabfrage.'
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(
        function (position) {

            const latLng = [
                position.coords.latitude,
                position.coords.longitude
            ];


            if (
                userLocationMarker
            ) {

                userLocationMarker.setLatLng(
                    latLng
                ).addTo(
                    map
                );

            }

            else {

                userLocationMarker =
                    L.circleMarker(
                        latLng,
                        {
                            radius:
                                9,

                            color:
                                '#ffffff',

                            weight:
                                3,

                            fillColor:
                                '#2563EB',

                            fillOpacity:
                                1
                        }
                    ).addTo(
                        map
                    ).bindTooltip(
                        'Dein Standort',
                        {
                            direction:
                                'top',

                            offset:
                                [
                                    0,
                                    -10
                                ]
                        }
                    );

            }


            if (
                locationControlButton
            ) {

                locationControlButton.setAttribute(
                    'aria-pressed',
                    'true'
                );

            }


            map.setView(
                latLng,
                Math.max(
                    map.getZoom(),
                    15
                )
            );

        },
        function (error) {

            const message =
                error.code ===
                    1
                    ? 'Die Standortfreigabe wurde abgelehnt.'
                    : 'Dein Standort konnte nicht ermittelt werden.';


            alert(
                message
            );

        },
        {
            enableHighAccuracy:
                true,

            timeout:
                10000,

            maximumAge:
                30000
        }
    );

}


const locationControl =
    L.control(
        {
            position:
                'topright'
        }
    );


locationControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                'button',
                'leaflet-control-locate'
            );


        button.type =
            'button';

        button.title =
            'Meinen Standort anzeigen';

        button.setAttribute(
            'aria-label',
            'Meinen Standort anzeigen'
        );

        button.setAttribute(
            'aria-pressed',
            'false'
        );

        button.innerHTML =
            '⌖';


        locationControlButton =
            button;


        L.DomEvent.disableClickPropagation(
            button
        );

        L.DomEvent.disableScrollPropagation(
            button
        );

        L.DomEvent.on(
            button,
            'click',
            showUserLocation
        );


        return button;

    };


locationControl.addTo(
    map
);


// ========================================
// SATELLITEN-BESCHRIFTUNGEN
// AUTOMATISCH EIN-/AUSSCHALTEN
// ========================================

map.on(
    'baselayerchange',
    function (event) {

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
// KATEGORIE-FILTER
// ========================================

let selectedCategory =
    'all';


function applyCategoryFilter() {

    spots.forEach(
        function (spot) {

            if (
                !spot ||
                !spot.marker
            ) {

                return;

            }


            // Neue, noch nicht gespeicherte
            // Spots bleiben sichtbar.

            if (
                !spot.saved
            ) {

                if (
                    !map.hasLayer(
                        spot.marker
                    )
                ) {

                    spot.marker.addTo(
                        map
                    );

                }

                return;

            }


            const matches =
                selectedCategory ===
                    'all' ||
                spot.category ===
                    selectedCategory;


            if (
                matches
            ) {

                if (
                    !map.hasLayer(
                        spot.marker
                    )
                ) {

                    spot.marker.addTo(
                        map
                    );

                }

            }

            else {

                if (
                    map.hasLayer(
                        spot.marker
                    )
                ) {

                    spot.marker.closePopup();

                    map.removeLayer(
                        spot.marker
                    );

                }

            }

        }
    );

}


// ========================================
// KATEGORIE-FILTER EINRICHTEN
// ========================================

function setupCategoryFilter() {

    const filter =
        document.getElementById(
            'category-filter'
        );


    const select =
        document.getElementById(
            'category-filter-select'
        );


    if (
        !filter ||
        !select
    ) {

        return;

    }


    L.DomEvent.disableClickPropagation(
        filter
    );


    L.DomEvent.disableScrollPropagation(
        filter
    );


    select.addEventListener(
        'change',
        function () {

            selectedCategory =
                select.value;

            applyCategoryFilter();

        }
    );


    applyCategoryFilter();

}


// ========================================
// SPOT HTML TEMPLATES
// ========================================

let spotEditorTemplate =
    null;


let spotInfoTemplate =
    null;


let spotTemplatesPromise =
    null;


// ========================================
// SPOT TEMPLATES LADEN
// ========================================

async function loadSpotTemplates() {

    if (
        spotTemplatesPromise
    ) {

        return spotTemplatesPromise;

    }


    spotTemplatesPromise =
        (async function () {

            try {

                const response =
                    await fetch(
                        'spots.html',
                        {
                            cache:
                                'no-store'
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `spots.html konnte nicht geladen werden (${response.status}).`
                    );

                }


                const html =
                    await response.text();


                const parser =
                    new DOMParser();


                const parsedDocument =
                    parser.parseFromString(
                        html,
                        'text/html'
                    );


                const editorTemplate =
                    parsedDocument.querySelector(
                        '#spot-editor-template'
                    );


                const infoTemplate =
                    parsedDocument.querySelector(
                        '#spot-info-template'
                    );


                if (
                    !editorTemplate
                ) {

                    throw new Error(
                        'Das Element #spot-editor-template wurde in spots.html nicht gefunden.'
                    );

                }


                if (
                    !infoTemplate
                ) {

                    throw new Error(
                        'Das Element #spot-info-template wurde in spots.html nicht gefunden.'
                    );

                }


                spotEditorTemplate =
                    editorTemplate.innerHTML.trim();


                spotInfoTemplate =
                    infoTemplate.innerHTML.trim();


                console.log(
                    'Spot-Templates erfolgreich geladen.'
                );


            }

            catch (error) {

                console.error(
                    'Fehler beim Laden der Spot-Templates:',
                    error
                );


                spotTemplatesPromise =
                    null;


                throw error;

            }

        })();


    return spotTemplatesPromise;

}


// ========================================
// TEMPLATE KLONEN
// ========================================

function createTemplateElement(
    templateHtml
) {

    if (
        !templateHtml
    ) {

        return null;

    }


    const template =
        document.createElement(
            'template'
        );


    template.innerHTML =
        templateHtml;


    return template.content
        .firstElementChild
        ?.cloneNode(
            true
        ) ||
        null;

}


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


        if (
            error
        ) {

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


        applyCategoryFilter();

    }

    catch (error) {

        console.error(
            'Unerwarteter Fehler beim Laden der Spots:',
            error
        );

    }

}


// ========================================
// SPOT AUS DATENBANK ERSTELLEN
// ========================================

function createSpotFromDatabase(
    row
) {

    const latitude =
        Number(
            row.latitude
        );


    const longitude =
        Number(
            row.longitude
        );


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        )
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
        ).addTo(
            map
        );


    const spot = {

        id:
            row.id,

        marker:
            marker,

        name:
            row.name ||
            '',

        description:
            row.description ||
            '',

        category:
            row.category ||
            'Architecture',

        rating:
            Number(
                row.rating ||
                0
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


    if (
        activeSpot.marker &&
        activeSpot.marker.getPopup()
    ) {

        activeSpot.marker.closePopup();

    }


    if (
        map.hasLayer(
            activeSpot.marker
        )
    ) {

        map.removeLayer(
            activeSpot.marker
        );

    }


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

        const popup =
            map._popup;


        if (
            popup &&
            popup.isOpen()
        ) {

            map.closePopup();

            return;

        }


        if (
            activeSpot !== null
        ) {

            removeActiveSpot();

        }


        createSpot(
            event.latlng
        );

    }
);


// ========================================
// SPOT ERSTELLEN
// ========================================

function createSpot(
    position
) {

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
        ).addTo(
            map
        );


    const spot = {

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


    activeSpot =
        spot;


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

            }

            else {

                openEditor(
                    spot
                );

            }

        }
    );


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


    openEditor(
        spot
    );

}


// ========================================
// EDITOR
// ========================================

async function openEditor(
    spot
) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    try {

        await loadSpotTemplates();


        const form =
            createTemplateElement(
                spotEditorTemplate
            );


        if (
            !form
        ) {

            console.error(
                'Spot-Editor konnte nicht aus dem Template erstellt werden.'
            );

            return;

        }


        const nameInput =
            form.querySelector(
                '.spot-name'
            );


        const descriptionInput =
            form.querySelector(
                '.spot-description'
            );


        const categoryInput =
            form.querySelector(
                '.spot-category'
            );


        if (
            nameInput
        ) {

            nameInput.value =
                spot.name ||
                '';

        }


        if (
            descriptionInput
        ) {

            descriptionInput.value =
                spot.description ||
                '';

        }


        if (
            categoryInput
        ) {

            categoryInput.value =
                spot.category ||
                'Architecture';

        }


        spot.marker.unbindPopup();


        spot.marker.bindPopup(
            form,
            {
                closeButton:
                    true,

                closeOnClick:
                    false,

                autoPan:
                    true,

                autoPanPadding:
                    [
                        20,
                        80
                    ],

                maxWidth:
                    340
            }
        );


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

    catch (error) {

        console.error(
            'Fehler beim Öffnen des Spot-Editors:',
            error
        );

    }

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

            closeOnClick:
                false,

            autoPan:
                true,

            autoPanPadding:
                [
                    20,
                    80
                ],

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
// E-MAIL ÜBER EDGE FUNCTION SENDEN
// ========================================

async function sendSpotEmail(
    spot,
    position
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
                    'send-email',
                    {
                        body: {

                            spot: {

                                id:
                                    spot.id,

                                name:
                                    spot.name,

                                description:
                                    spot.description,

                                category:
                                    spot.category,

                                latitude:
                                    position.lat,

                                longitude:
                                    position.lng

                            }

                        }

                    }
                );


        if (
            error
        ) {

            console.error(
                'Fehler beim Versenden der Spot-Mail:',
                error
            );

            return false;

        }


        if (
            data &&
            data.success ===
                true
        ) {

            console.log(
                'Spot-Mail erfolgreich versendet:',
                data
            );

            return true;

        }


        console.warn(
            'Spot-Mail: Unerwartete Antwort der Edge Function:',
            data
        );

        return false;

    }

    catch (error) {

        console.error(
            'Unerwarteter Fehler beim Versenden der Spot-Mail:',
            error
        );

        return false;

    }

}


// ========================================
// SPOT SPEICHERN
// ========================================

async function saveSpot(
    spot
) {

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
        // E-MAIL VERSENDEN
        // ========================================

        const emailSent =
            await sendSpotEmail(
                spot,
                position
            );


        if (
            !emailSent
        ) {

            console.warn(
                'Der Spot wurde gespeichert, aber die Benachrichtigungs-Mail konnte nicht versendet werden.'
            );

        }


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
        // KATEGORIE-FILTER ANWENDEN
        // ========================================

        applyCategoryFilter();


        // ========================================
        // GESPEICHERTEN SPOT ANZEIGEN
        // ========================================

        showSpot(
            spot
        );


    }

    catch (error) {

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
// INITIALISIERUNG
// ========================================

setupCategoryFilter();
loadSpots();
// ========================================
// GESPEICHERTEN SPOT ANZEIGEN
// ========================================

async function showSpot(
    spot
) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    try {

        await loadSpotTemplates();


        const info =
            createTemplateElement(
                spotInfoTemplate
            );


        if (
            !info
        ) {

            console.error(
                'Spot-Informationen konnten nicht aus dem Template erstellt werden.'
            );

            return;

        }


        const position =
            spot.marker.getLatLng();


        // ========================================
        // SPOT NAME
        // ========================================

        const title =
            info.querySelector(
                '.spot-title'
            );


        if (
            title
        ) {

            title.textContent =
                spot.name ||
                'Unbenannter Spot';

        }


        // ========================================
        // KATEGORIE
        // ========================================

        const category =
            info.querySelector(
                '.spot-category-value'
            );


        if (
            category
        ) {

            category.textContent =
                spot.category ||
                'Keine Kategorie';

        }


        // ========================================
        // BESCHREIBUNG
        // ========================================

        const description =
            info.querySelector(
                '.spot-description-value'
            );


        if (
            description
        ) {

            description.textContent =
                spot.description ||
                'Keine Beschreibung';

        }


        // ========================================
        // POSITION
        // ========================================

        const positionElement =
            info.querySelector(
                '.spot-position-value'
            );


        if (
            positionElement
        ) {

            positionElement.textContent =
                `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;

        }


        // ========================================
        // POPUP
        // ========================================

        markerPopup(
            spot,
            info,
            function (popup) {

                setupReport(
                    spot,
                    popup
                );

            }
        );

    }

    catch (error) {

        console.error(
            'Fehler beim Anzeigen des Spots:',
            error
        );

    }

}


// ========================================
// MELDE-DIALOG
// ========================================

function createReportDialog() {

    const overlay =
        document.createElement(
            'div'
        );


    overlay.className =
        'scapor-report-overlay';


    overlay.innerHTML = `

        <div
            class="scapor-report-dialog"
        >

            <div
                class="scapor-report-header"
            >

                <h3>
                    Spot melden
                </h3>


                <button
                    type="button"
                    class="scapor-report-close"
                    aria-label="Dialog schließen"
                >
                    ×
                </button>

            </div>


            <div
                class="scapor-report-content"
            >

                <p
                    class="report-spot-name"
                ></p>


                <label
                    for="scapor-report-reason"
                >
                    Grund der Meldung
                </label>


                <textarea
                    id="scapor-report-reason"
                    class="scapor-report-reason"
                    placeholder="Warum möchtest du diesen Spot melden?"
                ></textarea>


                <p
                    class="scapor-report-error"
                    hidden
                ></p>


                <div
                    class="scapor-report-actions"
                >

                    <button
                        type="button"
                        class="scapor-report-cancel"
                    >
                        Abbrechen
                    </button>


                    <button
                        type="button"
                        class="scapor-report-submit"
                    >
                        Meldung senden
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const closeButton =
        overlay.querySelector(
            '.scapor-report-close'
        );


    const cancelButton =
        overlay.querySelector(
            '.scapor-report-cancel'
        );


    const submitButton =
        overlay.querySelector(
            '.scapor-report-submit'
        );


    const textarea =
        overlay.querySelector(
            '#scapor-report-reason'
        );


    const errorMessage =
        overlay.querySelector(
            '.scapor-report-error'
        );


    // ========================================
    // DIALOG SCHLIESSEN
    // ========================================

    function closeDialog() {

        overlay.classList.remove(
            'open'
        );


        window.setTimeout(
            function () {

                if (
                    overlay.parentNode
                ) {

                    overlay.parentNode.removeChild(
                        overlay
                    );

                }

            },
            200
        );

    }


    // ========================================
    // SCHLIESSEN BUTTON
    // ========================================

    closeButton.addEventListener(
        'click',
        function () {

            closeDialog();

        }
    );


    // ========================================
    // ABBRECHEN BUTTON
    // ========================================

    cancelButton.addEventListener(
        'click',
        function () {

            closeDialog();

        }
    );


    // ========================================
    // MELDUNG SENDEN
    // ========================================

    submitButton.addEventListener(
        'click',
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            const reason =
                textarea.value.trim();


            // ========================================
            // GRUND PRÜFEN
            // ========================================

            if (
                reason === ''
            ) {

                errorMessage.textContent =
                    'Bitte gib einen Grund für die Meldung an.';

                errorMessage.hidden =
                    false;

                textarea.focus();

                return;

            }


            // ========================================
            // SPOT ERMITTELN
            // ========================================

            const reportSpotId =
                overlay.dataset.spotId ||
                null;


            const reportSpot =
                spots.find(
                    function (item) {

                        return String(
                            item.id
                        ) ===
                        String(
                            reportSpotId
                        );

                    }
                );


            if (
                !reportSpot ||
                !reportSpot.marker
            ) {

                errorMessage.textContent =
                    'Der Spot konnte nicht gefunden werden.';

                errorMessage.hidden =
                    false;

                return;

            }


            // ========================================
            // POSITION ERMITTELN
            // ========================================

            const position =
                reportSpot.marker.getLatLng();


            if (
                !position
            ) {

                errorMessage.textContent =
                    'Die Position des Spots konnte nicht ermittelt werden.';

                errorMessage.hidden =
                    false;

                return;

            }


            // ========================================
            // MELDEDATEN
            // ========================================

            const reportData = {

                spotId:
                    reportSpot.id,

                spotName:
                    reportSpot.name ||
                    'Unbenannter Spot',

                reason:
                    reason,

                latitude:
                    position.lat,

                longitude:
                    position.lng

            };


            // ========================================
            // BUTTON DEAKTIVIEREN
            // ========================================

            submitButton.disabled =
                true;


            submitButton.textContent =
                'Wird gesendet ...';


            errorMessage.textContent =
                '';


            errorMessage.hidden =
                true;


            // ========================================
            // E-MAIL ÜBER EDGE FUNCTION SENDEN
            // ========================================

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.functions.invoke(
                        'send-email',
                        {
                            body: {

                                report:
                                    reportData

                            }

                        }
                    );


                // ========================================
                // EDGE FUNCTION FEHLER
                // ========================================

                if (
                    error
                ) {

                    console.error(
                        'Fehler beim Senden der Spot-Meldung:',
                        error
                    );

                    throw error;

                }


                // ========================================
                // ANTWORT PRÜFEN
                // ========================================

                if (
                    !data ||
                    data.success !== true
                ) {

                    console.error(
                        'Unerwartete Antwort der Edge Function:',
                        data
                    );

                    throw new Error(
                        'Die Meldung konnte nicht bestätigt werden.'
                    );

                }


                // ========================================
                // SPOT ALS GEMELDET MARKIEREN
                // ========================================

                const {
                    error:
                        reportUpdateError
                } =
                    await supabaseClient
                        .from('spots')
                        .update({
                            reported:
                                true
                        })
                        .eq(
                            'id',
                            reportSpot.id
                        );


                if (
                    reportUpdateError
                ) {

                    console.error(
                        'Fehler beim Markieren des Spots als gemeldet:',
                        reportUpdateError
                    );

                    throw reportUpdateError;

                }


                // ========================================
                // ERFOLG
                // ========================================

                console.log(
                    'Spot-Meldung erfolgreich gesendet:',
                    data
                );


                closeDialog();


                alert(
                    'Vielen Dank. Deine Meldung wurde erfolgreich gesendet.'
                );


            }

            catch (error) {

                console.error(
                    'Fehler beim Senden der Spot-Meldung:',
                    error
                );


                errorMessage.textContent =
                    'Die Meldung konnte nicht gesendet werden. Bitte versuche es später erneut.';


                errorMessage.hidden =
                    false;

            }

            finally {

                // ========================================
                // BUTTON WIEDER AKTIVIEREN
                // ========================================

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    'Meldung senden';

            }

        }
    );


    // ========================================
    // KLICK AUF OVERLAY
    // ========================================

    overlay.addEventListener(
        'click',
        function (event) {

            if (
                event.target ===
                overlay
            ) {

                closeDialog();

            }

        }
    );


    // ========================================
    // ESCAPE
    // ========================================

    document.addEventListener(
        'keydown',
        function (event) {

            if (
                event.key ===
                    'Escape' &&
                overlay.classList.contains(
                    'open'
                )
            ) {

                closeDialog();

            }

        }
    );


    return overlay;

}


// ========================================
// MELDE-DIALOG ÖFFNEN
// ========================================

function openReportDialog(
    spot
) {

    if (
        !spot
    ) {

        return;

    }


    const overlay =
        createReportDialog();


    const spotName =
        overlay.querySelector(
            '.report-spot-name'
        );


    const textarea =
        overlay.querySelector(
            '#scapor-report-reason'
        );


    const errorMessage =
        overlay.querySelector(
            '.scapor-report-error'
        );


    overlay.dataset.spotId =
        spot.id ||
        '';


    overlay.dataset.spotName =
        spot.name ||
        'Unbenannter Spot';


    spotName.textContent =
        `Du möchtest den Spot „${
            spot.name ||
            'Unbenannter Spot'
        }“ melden.`;


    textarea.value =
        '';


    errorMessage.textContent =
        '';


    errorMessage.hidden =
        true;


    overlay.classList.add(
        'open'
    );


    window.setTimeout(
        function () {

            textarea.focus();

        },
        50
    );

}


// ========================================
// MELDE-BUTTON EINRICHTEN
// ========================================

function setupReport(
    spot,
    popup
) {

    if (
        !spot ||
        !spot.saved ||
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


    const reportButton =
        popupElement.querySelector(
            '.spot-report'
        );


    if (
        !reportButton
    ) {

        console.warn(
            'Melden-Button wurde im gespeicherten Spot nicht gefunden.'
        );

        return;

    }


    reportButton.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            openReportDialog(
                spot
            );

        }
    );

}


// ========================================
// E-MAIL ÜBER EDGE FUNCTION SENDEN
// ========================================

async function sendSpotEmail(
    spot,
    position
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.functions.invoke(
                'send-email',
                {
                    body: {

                        spot: {

                            id:
                                spot.id,

                            name:
                                spot.name,

                            description:
                                spot.description,

                            category:
                                spot.category,

                            latitude:
                                position.lat,

                            longitude:
                                position.lng

                        }

                    }

                }
            );


        if (
            error
        ) {

            console.error(
                'Fehler beim Versenden der Spot-Mail:',
                error
            );

            return false;

        }


        if (
            data &&
            data.success === true
        ) {

            console.log(
                'Spot-Mail erfolgreich versendet:',
                data
            );

            return true;

        }


        console.warn(
            'Spot-Mail: Unerwartete Antwort der Edge Function:',
            data
        );

        return false;

    }

    catch (error) {

        console.error(
            'Unerwarteter Fehler beim Versenden der Spot-Mail:',
            error
        );

        return false;

    }

}
