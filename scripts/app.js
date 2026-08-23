// ========================================
// INITIALISIERUNG
// ========================================

setupCategoryFilter();

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


        loadSpots();

    }
);

loadSpots();
