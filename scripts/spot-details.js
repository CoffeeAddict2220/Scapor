// ========================================
// KARTENLINKS EINRICHTEN
// ========================================

function setupSpotMapLinks(
    spot,
    info
) {

    const position =
        spot.marker.getLatLng();

    const openButton =
        info.querySelector(
            '.spot-map-open'
        );

    const options =
        info.querySelector(
            '.spot-map-options'
        );

    const appleLink =
        info.querySelector(
            '.spot-map-apple'
        );

    const googleLink =
        info.querySelector(
            '.spot-map-google'
        );


    if (
        !position ||
        !openButton ||
        !options ||
        !appleLink ||
        !googleLink
    ) {

        return;

    }


    const coordinates =
        position.lat +
        ',' +
        position.lng;

    const label =
        encodeURIComponent(
            spot.name ||
            'SCAPOR Spot'
        );


    appleLink.href =
        'https://maps.apple.com/?ll=' +
        coordinates +
        '&q=' +
        label;

    googleLink.href =
        'https://www.google.com/maps/search/?api=1&query=' +
        coordinates;


    openButton.addEventListener(
        'click',
        function (event) {

            event.preventDefault();
            event.stopPropagation();


            const willOpen =
                options.hidden;


            options.hidden =
                !willOpen;

            openButton.setAttribute(
                'aria-expanded',
                String(
                    willOpen
                )
            );

        }
    );

}


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
                getSpotCategories(spot).join(', ') ||
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


        setupSpotMapLinks(
            spot,
            info
        );


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

