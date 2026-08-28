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
