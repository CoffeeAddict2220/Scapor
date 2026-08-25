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


map.attributionControl.setPosition(
    "bottomleft"
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
                'bottomright'
        }
    ).addTo(
        map
    );


// ========================================
// KARTENAUSWAHL NUR PER KLICK ÖFFNEN
// ========================================

const layerControlContainer =
    layerControl.getContainer();


function closeScaporMapPanels(
    exceptPanel
) {

    if (
        exceptPanel !==
        'search'
    ) {

        setPlaceSearchOpen(
            false
        );

    }

    if (
        exceptPanel !==
        'filter'
    ) {

        setCategoryFilterOpen(
            false
        );

    }


    if (
        exceptPanel !==
        'layers'
    ) {

        layerControl.collapse();

    }


    if (
        exceptPanel !==
        'navigation'
    ) {

        window.closeScaporNavigationMenus?.();

    }

}


window.closeScaporMapPanels =
    closeScaporMapPanels;


let scaporPanelWasOpenOnPointerDown =
    false;


function closeOpenScaporPanelsBeforeMapAction() {

    const filterIsOpen =
        document.getElementById(
            'category-filter'
        )?.classList.contains(
            'category-filter-open'
        ) ||
        false;


    const searchIsOpen =
        document.getElementById(
            'place-search'
        )?.classList.contains(
            'place-search-open'
        ) ||
        false;


    const layersAreOpen =
        layerControlContainer.classList.contains(
            'leaflet-control-layers-expanded'
        );


    const navigationIsOpen =
        Array.from(
            document.querySelectorAll(
                '.navigation-menu'
            )
        ).some(
            function (menu) {

                return menu.open;

            }
        );


    const panelWasOpen =
        scaporPanelWasOpenOnPointerDown;


    scaporPanelWasOpenOnPointerDown =
        false;


    if (
        !filterIsOpen &&
        !searchIsOpen &&
        !layersAreOpen &&
        !navigationIsOpen &&
        !panelWasOpen
    ) {

        return false;

    }


    closeScaporMapPanels();

    return true;

}


window.closeOpenScaporPanelsBeforeMapAction =
    closeOpenScaporPanelsBeforeMapAction;


map.getContainer().addEventListener(
    'pointerdown',
    function (event) {

        if (
            event.target.closest(
                '.leaflet-control, .leaflet-popup'
            )
        ) {

            scaporPanelWasOpenOnPointerDown =
                false;

            return;

        }


        scaporPanelWasOpenOnPointerDown =
            document.getElementById(
                'category-filter'
            )?.classList.contains(
                'category-filter-open'
            ) ||
            document.getElementById(
                'place-search'
            )?.classList.contains(
                'place-search-open'
            ) ||
            layerControlContainer.classList.contains(
                'leaflet-control-layers-expanded'
            ) ||
            Array.from(
                document.querySelectorAll(
                    '.navigation-menu'
                )
            ).some(
                function (menu) {

                    return menu.open;

                }
            );

    },
    true
);


L.DomEvent.off(
    layerControlContainer,
    'mouseenter',
    layerControl._expandSafely,
    layerControl
);


// Kompatibilität mit Leaflet-Versionen,
// die direkt expand statt _expandSafely verwenden.

L.DomEvent.off(
    layerControlContainer,
    'mouseenter',
    layerControl.expand,
    layerControl
);


L.DomEvent.off(
    layerControlContainer,
    'mouseleave',
    layerControl.collapse,
    layerControl
);


layerControlContainer.addEventListener(
    'click',
    function (event) {

        window.cancelSpotCreationMode?.();

        closeScaporMapPanels(
            'layers'
        );

        if (
            !event.target.matches(
                '.leaflet-control-layers-selector'
            )
        ) {

            return;

        }


        window.setTimeout(
            function () {

                layerControl.collapse();

            },
            0
        );

    }
);


// ========================================
// KARTENANSICHT ZURÜCKSETZEN
// ========================================

const resetViewControl =
    L.control(
        {
            position:
                "bottomright"
        }
    );


resetViewControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                "button",
                "leaflet-control leaflet-control-reset-view"
            );


        button.type =
            "button";

        button.title =
            "Vollständige Kartenansicht anzeigen";

        button.setAttribute(
            "aria-label",
            "Vollständige Kartenansicht anzeigen"
        );

        button.innerHTML =
            `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></svg>`;


        L.DomEvent.disableClickPropagation(
            button
        );

        L.DomEvent.disableScrollPropagation(
            button
        );

        L.DomEvent.on(
            button,
            "click",
            function () {

                closeScaporMapPanels();

                map.setView(
                    [
                        51.1657,
                        10.4515
                    ],
                    6
                );

            }
        );


        return button;

    };


resetViewControl.addTo(
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

        showScaporAlert(
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
                    ? 'Der Standortzugriff wurde abgelehnt. Öffne die Website-Einstellungen deines Browsers, erlaube dort den Standortzugriff für SCAPOR und lade die Seite anschließend neu oder versuche es erneut.'
                    : 'Dein Standort konnte nicht ermittelt werden.';


            showScaporAlert(
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
                'bottomright'
        }
    );


locationControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                'button',
                'leaflet-control leaflet-control-locate'
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
            `
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M2 12h3"></path>
                <path d="M19 12h3"></path>
                <path d="M12 2v3"></path>
                <path d="M12 19v3"></path>
                <circle cx="12" cy="12" r="7"></circle>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
            `;


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
            function () {

                closeScaporMapPanels();
                showUserLocation();

            }
        );


        return button;

    };


locationControl.addTo(
    map
);


// ========================================
// KATEGORIE-FILTER EIN-/AUSBLENDEN
// ========================================

let categoryFilterControlButton =
    null;


function setCategoryFilterOpen(
    isOpen
) {

    const filter =
        document.getElementById(
            'category-filter'
        );


    if (
        !filter
    ) {

        return;

    }


    filter.classList.toggle(
        'category-filter-open',
        isOpen
    );


    filter.setAttribute(
        'aria-hidden',
        String(!isOpen)
    );


    if (
        categoryFilterControlButton
    ) {

        categoryFilterControlButton.setAttribute(
            'aria-expanded',
            String(isOpen)
        );

    }

}


const categoryFilterControl =
    L.control(
        {
            position:
                'bottomright'
        }
    );


categoryFilterControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                'button',
                'leaflet-control leaflet-control-category-filter'
            );


        button.type =
            'button';

        button.title =
            'Spot-Kategorien filtern';

        button.setAttribute(
            'aria-label',
            'Spot-Kategorien filtern'
        );

        button.setAttribute(
            'aria-controls',
            'category-filter'
        );

        button.setAttribute(
            'aria-expanded',
            'false'
        );

        button.innerHTML =
            `
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M4 5h16"></path>
                <path d="M7 12h10"></path>
                <path d="M10 19h4"></path>
            </svg>
            `;


        categoryFilterControlButton =
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
            function () {

                window.cancelSpotCreationMode?.();

                closeScaporMapPanels(
                    'filter'
                );

                const filter =
                    document.getElementById(
                        'category-filter'
                    );


                setCategoryFilterOpen(
                    !filter?.classList.contains(
                        'category-filter-open'
                    )
                );

            }
        );


        return button;

    };


categoryFilterControl.addTo(
    map
);


// ========================================
// ORTSSUCHE EIN-/AUSBLENDEN
// ========================================

let placeSearchControlButton =
    null;


function setPlaceSearchOpen(
    isOpen
) {

    const searchPanel =
        document.getElementById(
            'place-search'
        );


    if (
        !searchPanel
    ) {

        return;

    }


    searchPanel.classList.toggle(
        'place-search-open',
        isOpen
    );

    searchPanel.setAttribute(
        'aria-hidden',
        String(!isOpen)
    );


    placeSearchControlButton?.setAttribute(
        'aria-expanded',
        String(isOpen)
    );


    if (
        isOpen
    ) {

        window.setTimeout(
            function () {

                document.getElementById(
                    'place-search-input'
                )?.focus();

            },
            190
        );

    }

}


const placeSearchControl =
    L.control(
        {
            position:
                'bottomright'
        }
    );


placeSearchControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                'button',
                'leaflet-control leaflet-control-place-search'
            );


        button.type =
            'button';

        button.title =
            'Ort suchen';

        button.setAttribute(
            'aria-label',
            'Ort suchen'
        );

        button.setAttribute(
            'aria-controls',
            'place-search'
        );

        button.setAttribute(
            'aria-expanded',
            'false'
        );

        button.innerHTML =
            `
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m16 16 5 5"></path>
            </svg>
            `;


        placeSearchControlButton =
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
            function () {

                window.cancelSpotCreationMode?.();

                closeScaporMapPanels(
                    'search'
                );

                const searchPanel =
                    document.getElementById(
                        'place-search'
                    );


                setPlaceSearchOpen(
                    !searchPanel?.classList.contains(
                        'place-search-open'
                    )
                );

            }
        );


        return button;

    };


placeSearchControl.addTo(
    map
);


const placeSearchCache =
    new Map();


let lastPlaceSearchAt =
    0;


function showPlaceSearchResults(
    results
) {

    const resultsContainer =
        document.getElementById(
            'place-search-results'
        );

    const status =
        document.getElementById(
            'place-search-status'
        );


    if (
        !resultsContainer ||
        !status
    ) {

        return;

    }


    resultsContainer.replaceChildren();


    if (
        results.length ===
        0
    ) {

        status.textContent =
            'Kein passender Ort gefunden.';

        return;

    }


    status.textContent =
        `${results.length} Treffer gefunden`;


    results.forEach(
        function (result) {

            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';

            button.className =
                'place-search-result';

            button.textContent =
                result.display_name;


            button.addEventListener(
                'click',
                function () {

                    const bounds =
                        result.boundingbox?.map(
                            Number
                        );


                    closeScaporMapPanels();


                    if (
                        bounds?.length ===
                        4 &&
                        bounds.every(
                            Number.isFinite
                        )
                    ) {

                        map.fitBounds(
                            [
                                [
                                    bounds[0],
                                    bounds[2]
                                ],
                                [
                                    bounds[1],
                                    bounds[3]
                                ]
                            ],
                            {
                                maxZoom:
                                    16,

                                padding:
                                    [
                                        40,
                                        40
                                    ]
                            }
                        );

                    }

                    else {

                        map.setView(
                            [
                                Number(result.lat),
                                Number(result.lon)
                            ],
                            15
                        );

                    }

                }
            );


            resultsContainer.appendChild(
                button
            );

        }
    );

}


document.getElementById(
    'place-search-form'
)?.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const input =
            document.getElementById(
                'place-search-input'
            );

        const status =
            document.getElementById(
                'place-search-status'
            );

        const submitButton =
            event.currentTarget.querySelector(
                'button[type="submit"]'
            );

        const query =
            input?.value.trim();


        if (
            !query ||
            query.length <
            2
        ) {

            status.textContent =
                'Bitte gib mindestens zwei Zeichen ein.';

            return;

        }


        const cacheKey =
            query.toLocaleLowerCase(
                'de'
            );


        if (
            placeSearchCache.has(
                cacheKey
            )
        ) {

            showPlaceSearchResults(
                placeSearchCache.get(
                    cacheKey
                )
            );

            return;

        }


        submitButton.disabled =
            true;

        status.textContent =
            'Orte werden gesucht …';


        try {

            const remainingDelay =
                Math.max(
                    0,
                    1000 -
                    (
                        Date.now() -
                        lastPlaceSearchAt
                    )
                );


            if (
                remainingDelay >
                0
            ) {

                await new Promise(
                    function (resolve) {

                        window.setTimeout(
                            resolve,
                            remainingDelay
                        );

                    }
                );

            }


            const parameters =
                new URLSearchParams(
                    {
                        q:
                            query,

                        format:
                            'jsonv2',

                        limit:
                            '5',

                        addressdetails:
                            '0',

                        'accept-language':
                            'de'
                    }
                );


            lastPlaceSearchAt =
                Date.now();


            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/search?${parameters}`,
                    {
                        headers:
                            {
                                Accept:
                                    'application/json'
                            }
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    'Place search failed'
                );

            }


            const results =
                await response.json();


            placeSearchCache.set(
                cacheKey,
                results
            );


            showPlaceSearchResults(
                results
            );

        }

        catch (error) {

            console.error(
                'Ortssuche fehlgeschlagen:',
                error
            );

            status.textContent =
                'Die Ortssuche ist gerade nicht erreichbar. Bitte versuche es später erneut.';

        }

        finally {

            submitButton.disabled =
                false;

        }

    }
);


// ========================================
// SPOT-ERSTELLMODUS AKTIVIEREN
// ========================================

let addSpotControlButton =
    null;


function setAddSpotCreationModeActive(
    isActive
) {

    if (
        !addSpotControlButton
    ) {

        return;

    }


    addSpotControlButton.setAttribute(
        'aria-pressed',
        String(isActive)
    );

}


window.setAddSpotCreationModeActive =
    setAddSpotCreationModeActive;

const addSpotControl =
    L.control(
        {
            position:
                'bottomleft'
        }
    );


addSpotControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                'button',
                'leaflet-control leaflet-control-add-spot'
            );


        button.type =
            'button';

        button.title =
            'Neuen Spot erstellen';

        button.setAttribute(
            'aria-label',
            'Neuen Spot erstellen'
        );

        button.setAttribute(
            'aria-pressed',
            'false'
        );

        button.innerHTML =
            `
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
            >
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
            </svg>
            `;


        addSpotControlButton =
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
            function () {

                closeScaporMapPanels();
                window.toggleSpotCreationMode?.();

            }
        );


        return button;

    };


addSpotControl.addTo(
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


