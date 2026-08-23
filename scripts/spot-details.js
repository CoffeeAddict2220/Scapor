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


