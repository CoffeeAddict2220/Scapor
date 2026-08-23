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

        showScaporAlert(
            'Bitte gib einen Namen für den Spot ein.'
        ).then(
            function () {

                nameInput.focus();

            }
        );

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

        showScaporAlert(
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


            showScaporAlert(
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


            showScaporAlert(
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


        showScaporAlert(
            'Beim Speichern des Spots ist ein unerwarteter Fehler aufgetreten.'
        );

    }

}


