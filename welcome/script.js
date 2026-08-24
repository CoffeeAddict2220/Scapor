// ========================================
// SCAPOR WELCOME
// ========================================

(function () {

    const WELCOME_STORAGE_KEY =
        'scaporWelcomeShown';


    // ========================================
    // WILLKOMMENS-HTML LADEN
    // ========================================

    async function loadWelcome() {

        try {

            const response =
                await fetch(
                    './welcome/index.html',
                    {
                        cache: 'no-store'
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    `welcome.html konnte nicht geladen werden (${response.status}).`
                );

            }


            const html =
                await response.text();


            const template =
                document.createElement(
                    'template'
                );


            template.innerHTML =
                html.trim();


            const overlay =
                template.content.querySelector(
                    '#welcome-overlay'
                );


            if (
                !overlay
            ) {

                throw new Error(
                    'Das Element #welcome-overlay wurde in welcome.html nicht gefunden.'
                );

            }


            document.body.appendChild(
                overlay
            );


            setupWelcomeAd(
                overlay
            );


            setupWelcome(
                overlay
            );


        } catch (error) {

            console.error(
                'Fehler beim Laden des Welcome-Popups:',
                error
            );

        }

    }



// ========================================
// WILLKOMMENS-WERBUNG
// ========================================

function setupWelcomeAd(
    overlay
) {

    const adSlot =
        overlay.querySelector(
            '.welcome-ad .adsbygoogle'
        );


    const adContainer =
        adSlot?.closest(
            '.welcome-ad'
        );


    if (
        !adSlot ||
        !adContainer
    ) {

        return;

    }


    function updateAdVisibility() {

        adContainer.classList.toggle(
            'is-empty',
            adSlot.dataset.adStatus ===
                'unfilled'
        );

    }


    new MutationObserver(
        updateAdVisibility
    ).observe(
        adSlot,
        {
            attributes: true,
            attributeFilter: [
                'data-ad-status'
            ]
        }
    );


    window.setTimeout(
        function () {

            if (
                !adSlot.dataset.adStatus
            ) {

                adContainer.classList.add(
                    'is-empty'
                );

            }

        },
        3000
    );


    try {

        (
            window.adsbygoogle =
                window.adsbygoogle ||
                []
        ).push({});

    } catch (error) {

        adContainer.classList.add(
            'is-empty'
        );


        console.warn(
            'Willkommensanzeige konnte nicht geladen werden.',
            error
        );

    }

}

    // ========================================
    // WILLKOMMEN EINRICHTEN
    // ========================================

    function setupWelcome(
        overlay
    ) {

        const welcomeStart =
            overlay.querySelector(
                '#welcome-start'
            );


        const welcomeClose =
            overlay.querySelector(
                '#welcome-close'
            );


        const welcomeShown =
            sessionStorage.getItem(
                WELCOME_STORAGE_KEY
            );


        if (
            welcomeShown ===
            'true'
        ) {

            overlay.remove();

            return;

        }


        // ========================================
        // START-BUTTON
        // ========================================

        if (
            welcomeStart
        ) {

            welcomeStart.addEventListener(
                'click',
                closeWelcomePopup
            );

        }


        // ========================================
        // X-BUTTON
        // ========================================

        if (
            welcomeClose
        ) {

            welcomeClose.addEventListener(
                'click',
                closeWelcomePopup
            );

        }


        // ========================================
        // ESC-TASTE
        // ========================================

        document.addEventListener(
            'keydown',
            function (event) {

                if (
                    event.key ===
                    'Escape'
                ) {

                    closeWelcomePopup();

                }

            }
        );


        // ========================================
        // WILLKOMMEN SCHLIESSEN
        // ========================================

        function closeWelcomePopup() {

            overlay.style.display =
                'none';


            sessionStorage.setItem(
                WELCOME_STORAGE_KEY,
                'true'
            );

        }

    }


    // ========================================
    // START
    // ========================================

    window.scaporWelcomeReady =
        new Promise(
            function (resolve) {

                function startWelcome() {

                    loadWelcome().finally(
                        resolve
                    );

                }


                if (
                    document.readyState ===
                    'loading'
                ) {

                    document.addEventListener(
                        'DOMContentLoaded',
                        startWelcome,
                        {
                            once:
                                true
                        }
                    );

                } else {

                    startWelcome();

                }

            }
        );

})();
