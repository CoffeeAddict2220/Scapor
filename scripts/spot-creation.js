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

let spotCreationModeActive =
    false;


function setSpotCreationMode(
    isActive
) {

    spotCreationModeActive =
        isActive;


    window.setAddSpotCreationModeActive?.(
        isActive
    );


    if (
        isActive
    ) {

        if (
            activeSpot !==
            null
        ) {

            removeActiveSpot();

        }


        map.closePopup();
        window.showScaporCreationHint?.();

    }

    else {

        window.hideScaporCreationHint?.();

    }

}


window.toggleSpotCreationMode =
    function () {

        setSpotCreationMode(
            !spotCreationModeActive
        );

    };


window.cancelSpotCreationMode =
    function () {

        if (
            !spotCreationModeActive
        ) {

            return;

        }


        setSpotCreationMode(
            false
        );

    };

map.on(
    'click',
    function (event) {

        if (
            window.closeOpenScaporPanelsBeforeMapAction?.()
        ) {

            return;

        }

        if (
            activeSpot !== null
        ) {

            removeActiveSpot();

            return;

        }


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
            !spotCreationModeActive
        ) {

            return;

        }


        setSpotCreationMode(
            false
        );


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
