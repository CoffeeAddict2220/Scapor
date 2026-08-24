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


