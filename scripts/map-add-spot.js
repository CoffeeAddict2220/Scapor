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
