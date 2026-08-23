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


