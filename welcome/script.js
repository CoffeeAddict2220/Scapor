// ========================================
// SCAPOR WELCOME
// ========================================

(function () {

    const WELCOME_STORAGE_KEY =
        'scaporWelcomeShown';


    let creationHintHideTimer =
        null;


    let creationHintRemoveTimer =
        null;


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
    // HINWEIS IM SPOT-ERSTELLMODUS
    // ========================================

    function hideCreationHint() {

        const hint =
            document.querySelector(
                '.creation-hint'
            );


        window.clearTimeout(
            creationHintHideTimer
        );

        window.clearTimeout(
            creationHintRemoveTimer
        );


        if (
            !hint
        ) {

            return;

        }


        hint.classList.remove(
            'creation-hint-visible'
        );


        creationHintRemoveTimer =
            window.setTimeout(
                function () {

                    hint.remove();

                },
                250
            );

    }


    function showCreationHint(
        persistent = false
    ) {

        window.clearTimeout(
            creationHintHideTimer
        );

        window.clearTimeout(
            creationHintRemoveTimer
        );

        const existingHint =
            document.querySelector(
                '.creation-hint'
            );


        if (
            existingHint
        ) {

            existingHint.remove();

        }


        const hint =
            document.createElement(
                'div'
            );


        hint.className =
            'creation-hint';


        hint.setAttribute(
            'role',
            'status'
        );


        hint.setAttribute(
            'aria-live',
            'polite'
        );


        hint.textContent =
            'Zum Erstellen eines Spots auf die Karte tippen';


        document.body.appendChild(
            hint
        );


        window.requestAnimationFrame(
            function () {

                hint.classList.add(
                    'creation-hint-visible'
                );

            }
        );


        if (
            !persistent
        ) {

            creationHintHideTimer =
                window.setTimeout(
                    hideCreationHint,
                    3200
                );

        }

    }


    window.showScaporCreationHint =
        function () {

            showCreationHint(
                true
            );

        };


    window.hideScaporCreationHint =
        hideCreationHint;


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
