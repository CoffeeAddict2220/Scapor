// ========================================
// SCAPOR NEU HIER
// ========================================

(function () {

    let welcomeOverlay =
        null;


    let welcomeLoadPromise =
        null;


    let updateWelcomeScrollHint =
        null;


    let creationHintHideTimer =
        null;


    let creationHintRemoveTimer =
        null;


    // ========================================
    // NEU-HIER-HTML LADEN
    // ========================================

    function loadWelcome() {

        if (
            welcomeOverlay
        ) {

            return Promise.resolve(
                welcomeOverlay
            );

        }


        if (
            welcomeLoadPromise
        ) {

            return welcomeLoadPromise;

        }


        welcomeLoadPromise =
            fetch(
                './welcome/index.html'
            )
                .then(
                    function (response) {

                        if (
                            !response.ok
                        ) {

                            throw new Error(
                                `Neu-hier-Ansicht konnte nicht geladen werden (${response.status}).`
                            );

                        }


                        return response.text();

                    }
                )
                .then(
                    function (html) {

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
                                'Das Element #welcome-overlay wurde nicht gefunden.'
                            );

                        }


                        document.body.appendChild(
                            overlay
                        );


                        welcomeOverlay =
                            overlay;


                        setupWelcome(
                            overlay
                        );


                        return overlay;

                    }
                )
                .catch(
                    function (error) {

                        welcomeLoadPromise =
                            null;


                        console.error(
                            'Fehler beim Laden der Neu-hier-Ansicht:',
                            error
                        );


                        showScaporAlert?.(
                            'Die Neu-hier-Ansicht konnte nicht geladen werden. Bitte lade die Seite neu.',
                            {
                                title:
                                    'Ansicht nicht verfügbar'
                            }
                        );


                        throw error;

                    }
                );


        return welcomeLoadPromise;

    }


    // ========================================
    // NEU-HIER-ANSICHT ÖFFNEN
    // ========================================

    async function openWelcomePopup() {

        const openButton =
            document.getElementById(
                'new-here-button'
            );


        window.cancelSpotCreationMode?.();


        window.closeScaporMapPanels?.(
            'welcome'
        );


        try {

            const overlay =
                await loadWelcome();


            overlay.classList.add(
                'welcome-overlay-visible'
            );


            overlay.setAttribute(
                'aria-hidden',
                'false'
            );


            const scrollContent =
                overlay.querySelector(
                    '.welcome-content'
                );


            if (
                scrollContent
            ) {

                scrollContent.scrollTop =
                    0;

            }


            window.requestAnimationFrame(
                function () {

                    updateWelcomeScrollHint?.();

                }
            );


            openButton?.setAttribute(
                'aria-expanded',
                'true'
            );


            overlay.querySelector(
                '#welcome-close'
            )?.focus();

        }

        catch {

            openButton?.setAttribute(
                'aria-expanded',
                'false'
            );

        }

    }


    // ========================================
    // NEU-HIER-ANSICHT SCHLIESSEN
    // ========================================

    function closeWelcomePopup() {

        if (
            !welcomeOverlay?.classList.contains(
                'welcome-overlay-visible'
            )
        ) {

            return;

        }


        welcomeOverlay.classList.remove(
            'welcome-overlay-visible'
        );


        welcomeOverlay.setAttribute(
            'aria-hidden',
            'true'
        );


        welcomeOverlay.querySelector(
            '#welcome-scroll-hint'
        )?.classList.remove(
            'welcome-scroll-hint-visible'
        );


        const openButton =
            document.getElementById(
                'new-here-button'
            );


        openButton?.setAttribute(
            'aria-expanded',
            'false'
        );


        openButton?.focus();

    }


    // ========================================
    // NEU-HIER-ANSICHT EINRICHTEN
    // ========================================

    function setupWelcome(
        overlay
    ) {

        overlay.querySelector(
            '#welcome-start'
        )?.addEventListener(
            'click',
            closeWelcomePopup
        );


        overlay.querySelector(
            '#welcome-close'
        )?.addEventListener(
            'click',
            closeWelcomePopup
        );


        const scrollContent =
            overlay.querySelector(
                '.welcome-content'
            );


        const scrollHint =
            overlay.querySelector(
                '#welcome-scroll-hint'
            );


        if (
            scrollContent &&
            scrollHint
        ) {

            updateWelcomeScrollHint =
                function () {

                    const remainingScroll =
                        scrollContent.scrollHeight -
                        scrollContent.clientHeight -
                        scrollContent.scrollTop;


                    const showHint =
                        scrollContent.scrollHeight >
                            scrollContent.clientHeight + 2 &&
                        remainingScroll > 12;


                    scrollHint.classList.toggle(
                        'welcome-scroll-hint-visible',
                        showHint
                    );


                    scrollHint.setAttribute(
                        'aria-hidden',
                        String(
                            !showHint
                        )
                    );

                };


            scrollContent.addEventListener(
                'scroll',
                updateWelcomeScrollHint,
                {
                    passive:
                        true
                }
            );


            window.addEventListener(
                'resize',
                updateWelcomeScrollHint
            );


            if (
                'ResizeObserver' in window
            ) {

                new ResizeObserver(
                    updateWelcomeScrollHint
                ).observe(
                    scrollContent
                );

            }

        }


        overlay.addEventListener(
            'pointerdown',
            function (event) {

                if (
                    event.target ===
                    overlay
                ) {

                    closeWelcomePopup();

                }

            }
        );

    }


    function setupNewHereButton() {

        document.getElementById(
            'new-here-button'
        )?.addEventListener(
            'click',
            openWelcomePopup
        );

    }


    function highlightNewHereButton() {

        const button =
            document.getElementById(
                'new-here-button'
            );


        if (
            !button
        ) {

            return;

        }


        button.classList.add(
            'new-here-button-highlight'
        );


        window.setTimeout(
            function () {

                button.classList.remove(
                    'new-here-button-highlight'
                );

            },
            3900
        );

    }

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


    window.openScaporWelcome =
        openWelcomePopup;


    window.highlightScaporNewHereButton =
        highlightNewHereButton;


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

                    setupNewHereButton();
                    resolve();

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

                }

                else {

                    startWelcome();

                }

            }
        );

})();
