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
