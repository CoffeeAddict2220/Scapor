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


    const websiteInput =
        popupElement.querySelector(
            '.spot-website'
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

    const name =
        nameInput.value.trim();


    const description =
        descriptionInput.value.trim();


    const spamCheck =
        validateNewSpotSubmission({
            name:
                name,

            description:
                description,

            category:
                categoryInput.value,

            website:
                websiteInput?.value || '',

            openedAt:
                Number(
                    popupElement.querySelector(
                        '.marker-form'
                    )?.dataset.openedAt ||
                    0
                )
        });


    if (
        !spamCheck.valid
    ) {

        showScaporAlert(
            spamCheck.message
        );

        return;

    }


    // ========================================
    // DATEN ÜBERNEHMEN
    // ========================================

    spot.name =
        name;


    spot.description =
        description;


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
                .functions
                .invoke(
                    'create-spot',
                    {
                        body: {
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
                );


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
            !data?.spot
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
            data.spot.id;


        rememberSpotSubmission();


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


        removeActiveSpot();


        showScaporAlert(
            'Danke! Dein Spot wurde zur Prüfung eingereicht und erscheint nach der Freigabe auf der Karte.'
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


