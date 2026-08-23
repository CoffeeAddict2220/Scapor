const loadingMessage =
    document.getElementById(
        'loading-message'
    );


const loadingState =
    document.getElementById(
        'loading-state'
    );


const errorState =
    document.getElementById(
        'error-state'
    );


const retryButton =
    document.getElementById(
        'retry-button'
    );


const messages = [
    'Spots werden geladen',
    'Karte wird vorbereitet',
    'Entdeckungen werden eingezeichnet'
];


let messageIndex =
    0;


if (
    loadingMessage &&
    !window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches
) {

    window.setInterval(
        function () {

            loadingMessage.classList.add(
                'is-changing'
            );


            window.setTimeout(
                function () {

                    messageIndex =
                        (messageIndex + 1) %
                        messages.length;


                    loadingMessage.textContent =
                        messages[messageIndex];


                    loadingMessage.classList.remove(
                        'is-changing'
                    );

                },
                170
            );

        },
        1800
    );

}


function showLoadingState() {

    loadingState.hidden =
        false;

    errorState.hidden =
        true;

}


function showErrorState() {

    loadingState.hidden =
        true;

    errorState.hidden =
        false;

    retryButton.focus();

}


window.addEventListener(
    'message',
    function (event) {

        if (
            event.origin !== window.location.origin
        ) {

            return;

        }


        if (
            event.data?.type === 'scapor:loading-error'
        ) {

            showErrorState();

        }


        if (
            event.data?.type === 'scapor:loading-retry-started'
        ) {

            showLoadingState();

        }

    }
);


retryButton.addEventListener(
    'click',
    function () {

        showLoadingState();

        window.parent.postMessage(
            {
                type: 'scapor:retry-loading-spots'
            },
            window.location.origin
        );

    }
);
