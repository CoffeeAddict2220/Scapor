// ========================================
// EIGENEN STANDORT ANZEIGEN
// ========================================

let userLocationMarker =
    null;


let userLocationPosition =
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


            userLocationPosition =
                L.latLng(
                    latLng
                );


            window.updateSpotListLocation?.(
                userLocationPosition
            );


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
