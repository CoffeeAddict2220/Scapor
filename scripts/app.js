// ========================================
// INITIALISIERUNG
// ========================================

setupCategoryFilter();


function waitForPageLoad() {

    if (
        document.readyState ===
        'complete'
    ) {

        return Promise.resolve();

    }


    return new Promise(
        function (resolve) {

            window.addEventListener(
                'load',
                resolve,
                {
                    once:
                        true
                }
            );

        }
    );

}


function hideLoadingScreen() {

    const loadingScreen =
        document.getElementById(
            'spots-loading-screen'
        );


    if (
        !loadingScreen
    ) {

        return;

    }


    loadingScreen.classList.add(
        'is-hidden'
    );

    loadingScreen.setAttribute(
        'aria-hidden',
        'true'
    );


    window.setTimeout(
        function () {

            loadingScreen.remove();


            window.highlightScaporNewHereButton?.();

        },
        500
    );

}


async function initializeScapor() {

    const spotsLoaded =
        await loadSpots();


    if (
        !spotsLoaded
    ) {

        const loadingScreen =
            document.getElementById(
                'spots-loading-screen'
            );


        loadingScreen?.contentWindow?.postMessage(
            {
                type: 'scapor:loading-error'
            },
            window.location.origin
        );

        return;

    }


    await Promise.all([
        waitForPageLoad(),
        window.scaporWelcomeReady ||
            Promise.resolve()
    ]);


    map.invalidateSize();


    window.requestAnimationFrame(
        function () {

            window.requestAnimationFrame(
                hideLoadingScreen
            );

        }
    );

}

window.addEventListener(
    'message',
    function (event) {

        if (
            event.origin !== window.location.origin ||
            event.data?.type !== 'scapor:retry-loading-spots'
        ) {

            return;

        }


        const loadingScreen =
            document.getElementById(
                'spots-loading-screen'
            );


        loadingScreen?.contentWindow?.postMessage(
            {
                type: 'scapor:loading-retry-started'
            },
            window.location.origin
        );


        initializeScapor();

    }
);

initializeScapor();
