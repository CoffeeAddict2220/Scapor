// ========================================
// MELDE-DIALOG ÖFFNEN
// ========================================

function openReportDialog(
    spot
) {

    if (
        !spot
    ) {

        return;

    }


    const overlay =
        createReportDialog();


    const spotName =
        overlay.querySelector(
            '.report-spot-name'
        );


    const textarea =
        overlay.querySelector(
            '#scapor-report-reason'
        );


    const errorMessage =
        overlay.querySelector(
            '.scapor-report-error'
        );


    overlay.dataset.spotId =
        spot.id ||
        '';


    overlay.dataset.spotName =
        spot.name ||
        'Unbenannter Spot';


    spotName.textContent =
        `Du möchtest den Spot „${
            spot.name ||
            'Unbenannter Spot'
        }“ melden.`;


    textarea.value =
        '';


    errorMessage.textContent =
        '';


    errorMessage.hidden =
        true;


    overlay.classList.add(
        'open'
    );


    window.setTimeout(
        function () {

            textarea.focus();

        },
        50
    );

}


// ========================================
// MELDE-BUTTON EINRICHTEN
// ========================================

function setupReport(
    spot,
    popup
) {

    if (
        !spot ||
        !spot.saved ||
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


    const reportButton =
        popupElement.querySelector(
            '.spot-report'
        );


    if (
        !reportButton
    ) {

        console.warn(
            'Melden-Button wurde im gespeicherten Spot nicht gefunden.'
        );

        return;

    }


    reportButton.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            openReportDialog(
                spot
            );

        }
    );

}


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
            await supabaseClient.functions.invoke(
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
            data.success === true
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
