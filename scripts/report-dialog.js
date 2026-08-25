// ========================================
// MELDE-DIALOG
// ========================================

function createReportDialog() {

    const overlay =
        document.createElement(
            'div'
        );


    overlay.className =
        'scapor-report-overlay';


    overlay.innerHTML = `

        <div
            class="scapor-report-dialog"
        >

            <div
                class="scapor-report-header"
            >

                <h3>
                    Spot melden
                </h3>


                <button
                    type="button"
                    class="scapor-report-close"
                    aria-label="Dialog schließen"
                >
                    ×
                </button>

            </div>


            <div
                class="scapor-report-content"
            >

                <p
                    class="report-spot-name"
                ></p>


                <label
                    for="scapor-report-reason"
                >
                    Grund der Meldung
                </label>


                <textarea
                    id="scapor-report-reason"
                    class="scapor-report-reason"
                    placeholder="Warum möchtest du diesen Spot melden?"
                ></textarea>

                <p
                    class="scapor-report-error"
                    hidden
                ></p>


                <div
                    class="scapor-report-actions"
                >

                    <button
                        type="button"
                        class="scapor-report-cancel"
                    >
                        Abbrechen
                    </button>


                    <button
                        type="button"
                        class="scapor-report-submit"
                    >
                        Meldung senden
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const closeButton =
        overlay.querySelector(
            '.scapor-report-close'
        );


    const cancelButton =
        overlay.querySelector(
            '.scapor-report-cancel'
        );


    const submitButton =
        overlay.querySelector(
            '.scapor-report-submit'
        );


    const textarea =
        overlay.querySelector(
            '#scapor-report-reason'
        );


    const errorMessage =
        overlay.querySelector(
            '.scapor-report-error'
        );


    // ========================================
    // DIALOG SCHLIESSEN
    // ========================================

    function closeDialog() {

        overlay.classList.remove(
            'open'
        );


        window.setTimeout(
            function () {

                if (
                    overlay.parentNode
                ) {

                    overlay.parentNode.removeChild(
                        overlay
                    );

                }

            },
            200
        );

    }


    // ========================================
    // SCHLIESSEN BUTTON
    // ========================================

    closeButton.addEventListener(
        'click',
        function () {

            closeDialog();

        }
    );


    // ========================================
    // ABBRECHEN BUTTON
    // ========================================

    cancelButton.addEventListener(
        'click',
        function () {

            closeDialog();

        }
    );


    // ========================================
    // MELDUNG SENDEN
    // ========================================

    submitButton.addEventListener(
        'click',
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            const reason =
                textarea.value.trim();

            // ========================================
            // GRUND PRÜFEN
            // ========================================

            if (
                reason === ''
            ) {

                errorMessage.textContent =
                    'Bitte gib einen Grund für die Meldung an.';

                errorMessage.hidden =
                    false;

                textarea.focus();

                return;

            }


            // ========================================
            // SPOT ERMITTELN
            // ========================================

            const reportSpotId =
                overlay.dataset.spotId ||
                null;


            const reportSpot =
                spots.find(
                    function (item) {

                        return String(
                            item.id
                        ) ===
                        String(
                            reportSpotId
                        );

                    }
                );


            if (
                !reportSpot ||
                !reportSpot.marker
            ) {

                errorMessage.textContent =
                    'Der Spot konnte nicht gefunden werden.';

                errorMessage.hidden =
                    false;

                return;

            }


            // ========================================
            // POSITION ERMITTELN
            // ========================================

            const position =
                reportSpot.marker.getLatLng();


            if (
                !position
            ) {

                errorMessage.textContent =
                    'Die Position des Spots konnte nicht ermittelt werden.';

                errorMessage.hidden =
                    false;

                return;

            }


            // ========================================
            // MELDEDATEN
            // ========================================

            const reportData = {

                spotId:
                    reportSpot.id,

                spotName:
                    reportSpot.name ||
                    'Unbenannter Spot',

                reason:
                    reason,

                latitude:
                    position.lat,

                longitude:
                    position.lng

            };


            // ========================================
            // BUTTON DEAKTIVIEREN
            // ========================================

            submitButton.disabled =
                true;


            submitButton.textContent =
                'Wird gesendet ...';


            errorMessage.textContent =
                '';


            errorMessage.hidden =
                true;


            // ========================================
            // E-MAIL ÜBER EDGE FUNCTION SENDEN
            // ========================================

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.functions.invoke(
                        'send-email',
                        {
                            body: {

                                report:
                                    reportData

                            }

                        }
                    );


                // ========================================
                // EDGE FUNCTION FEHLER
                // ========================================

                if (
                    error
                ) {

                    console.error(
                        'Fehler beim Senden der Spot-Meldung:',
                        error
                    );

                    throw error;

                }


                // ========================================
                // ANTWORT PRÜFEN
                // ========================================

                if (
                    !data ||
                    data.success !== true
                ) {

                    console.error(
                        'Unerwartete Antwort der Edge Function:',
                        data
                    );

                    throw new Error(
                        'Die Meldung konnte nicht bestätigt werden.'
                    );

                }


                // ========================================
                // SPOT ALS GEMELDET MARKIEREN
                // ========================================

                const {
                    error:
                        reportUpdateError
                } =
                    await supabaseClient
                        .from('spots')
                        .update({
                            reported:
                                true
                        })
                        .eq(
                            'id',
                            reportSpot.id
                        );


                if (
                    reportUpdateError
                ) {

                    console.error(
                        'Fehler beim Markieren des Spots als gemeldet:',
                        reportUpdateError
                    );

                    throw reportUpdateError;

                }


                // ========================================
                // ERFOLG
                // ========================================

                closeDialog();


                showScaporAlert(
                    'Deine Meldung wurde erfolgreich gesendet.',
                    {
                        title:
                            'Vielen Dank',

                        icon:
                            '✓'
                    }
                );


            }

            catch (error) {

                console.error(
                    'Fehler beim Senden der Spot-Meldung:',
                    error
                );


                errorMessage.textContent =
                    'Die Meldung konnte nicht gesendet werden. Bitte versuche es später erneut.';


                errorMessage.hidden =
                    false;

            }

            finally {

                // ========================================
                // BUTTON WIEDER AKTIVIEREN
                // ========================================

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    'Meldung senden';

            }

        }
    );


    // ========================================
    // KLICK AUF OVERLAY
    // ========================================

    overlay.addEventListener(
        'click',
        function (event) {

            if (
                event.target ===
                overlay
            ) {

                closeDialog();

            }

        }
    );


    // ========================================
    // ESCAPE
    // ========================================

    document.addEventListener(
        'keydown',
        function (event) {

            if (
                event.key ===
                    'Escape' &&
                overlay.classList.contains(
                    'open'
                )
            ) {

                closeDialog();

            }

        }
    );


    return overlay;

}


