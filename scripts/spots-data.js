// ========================================
// SPOTS
// ========================================

const spots = [];


// Aktuell bearbeiteter,
// noch nicht gespeicherter Spot

let activeSpot = null;


// ========================================
// KATEGORIE-FILTER
// ========================================

let selectedCategory =
    'all';


function applyCategoryFilter() {

    spots.forEach(
        function (spot) {

            if (
                !spot ||
                !spot.marker
            ) {

                return;

            }


            // Neue, noch nicht gespeicherte
            // Spots bleiben sichtbar.

            if (
                !spot.saved
            ) {

                if (
                    !map.hasLayer(
                        spot.marker
                    )
                ) {

                    spot.marker.addTo(
                        map
                    );

                }

                return;

            }


            const matches =
                selectedCategory ===
                    'all' ||
                spot.category ===
                    selectedCategory;


            if (
                matches
            ) {

                if (
                    !map.hasLayer(
                        spot.marker
                    )
                ) {

                    spot.marker.addTo(
                        map
                    );

                }

            }

            else {

                if (
                    map.hasLayer(
                        spot.marker
                    )
                ) {

                    spot.marker.closePopup();

                    map.removeLayer(
                        spot.marker
                    );

                }

            }

        }
    );

}


// ========================================
// KATEGORIE-FILTER EINRICHTEN
// ========================================

function setupCategoryFilter() {

    const filter =
        document.getElementById(
            'category-filter'
        );


    const select =
        document.getElementById(
            'category-filter-select'
        );


    if (
        !filter ||
        !select
    ) {

        return;

    }


    L.DomEvent.disableClickPropagation(
        filter
    );


    L.DomEvent.disableScrollPropagation(
        filter
    );


    select.addEventListener(
        'change',
        function () {

            selectedCategory =
                select.value;

            applyCategoryFilter();

        }
    );


    applyCategoryFilter();

}


// ========================================
// SPOT HTML TEMPLATES
// ========================================

let spotEditorTemplate =
    null;


let spotInfoTemplate =
    null;


let spotTemplatesPromise =
    null;


// ========================================
// SPOT TEMPLATES LADEN
// ========================================

async function loadSpotTemplates() {

    if (
        spotTemplatesPromise
    ) {

        return spotTemplatesPromise;

    }


    spotTemplatesPromise =
        (async function () {

            try {

                const response =
                    await fetch(
                        'spots.html',
                        {
                            cache:
                                'no-store'
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `spots.html konnte nicht geladen werden (${response.status}).`
                    );

                }


                const html =
                    await response.text();


                const parser =
                    new DOMParser();


                const parsedDocument =
                    parser.parseFromString(
                        html,
                        'text/html'
                    );


                const editorTemplate =
                    parsedDocument.querySelector(
                        '#spot-editor-template'
                    );


                const infoTemplate =
                    parsedDocument.querySelector(
                        '#spot-info-template'
                    );


                if (
                    !editorTemplate
                ) {

                    throw new Error(
                        'Das Element #spot-editor-template wurde in spots.html nicht gefunden.'
                    );

                }


                if (
                    !infoTemplate
                ) {

                    throw new Error(
                        'Das Element #spot-info-template wurde in spots.html nicht gefunden.'
                    );

                }


                spotEditorTemplate =
                    editorTemplate.innerHTML.trim();


                spotInfoTemplate =
                    infoTemplate.innerHTML.trim();


                console.log(
                    'Spot-Templates erfolgreich geladen.'
                );


            }

            catch (error) {

                console.error(
                    'Fehler beim Laden der Spot-Templates:',
                    error
                );


                spotTemplatesPromise =
                    null;


                throw error;

            }

        })();


    return spotTemplatesPromise;

}


// ========================================
// TEMPLATE KLONEN
// ========================================

function createTemplateElement(
    templateHtml
) {

    if (
        !templateHtml
    ) {

        return null;

    }


    const template =
        document.createElement(
            'template'
        );


    template.innerHTML =
        templateHtml;


    return template.content
        .firstElementChild
        ?.cloneNode(
            true
        ) ||
        null;

}


// ========================================
// SPOTS AUS SUPABASE LADEN
// ========================================

async function loadSpots() {

    let loadingFailed =
        false;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from('spots')
                .select('*')
                .order(
                    'created_at',
                    {
                        ascending:
                            true
                    }
                );


        if (
            error
        ) {

            loadingFailed =
                true;

            console.error(
                'Fehler beim Laden der Spots:',
                error
            );

            return;

        }


        console.log(
            'Spots aus Supabase geladen:',
            data
        );


        data.forEach(
            function (row) {

                createSpotFromDatabase(
                    row
                );

            }
        );


        applyCategoryFilter();

    }

    catch (error) {

        loadingFailed =
            true;

        console.error(
            'Unerwarteter Fehler beim Laden der Spots:',
            error
        );

    }

    finally {

        const loadingScreen =
            document.getElementById(
                'spots-loading-screen'
            );


        if (
            loadingScreen
        ) {

            if (
                loadingFailed
            ) {

                loadingScreen.contentWindow?.postMessage(
                    {
                        type: 'scapor:loading-error'
                    },
                    window.location.origin
                );

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

                },
                500
            );

        }

    }

}


// ========================================
// SPOT AUS DATENBANK ERSTELLEN
// ========================================

function createSpotFromDatabase(
    row
) {

    const latitude =
        Number(
            row.latitude
        );


    const longitude =
        Number(
            row.longitude
        );


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        )
    ) {

        console.error(
            'Ungültige Position für Spot:',
            row
        );

        return;

    }


    const position = [
        latitude,
        longitude
    ];


    const marker =
        L.marker(
            position,
            {
                draggable:
                    false,

                icon:
                    createSavedIcon(),

                autoPan:
                    true
            }
        ).addTo(
            map
        );


    const spot = {

        id:
            row.id,

        marker:
            marker,

        name:
            row.name ||
            '',

        description:
            row.description ||
            '',

        category:
            row.category ||
            'Architecture',

        rating:
            Number(
                row.rating ||
                0
            ),

        saved:
            true

    };


    spots.push(
        spot
    );


    // ========================================
    // MARKER KLICK
    // ========================================

    marker.on(
        'click',
        function (event) {

            L.DomEvent.stopPropagation(
                event
            );


            if (
                activeSpot !== null &&
                activeSpot !== spot &&
                !activeSpot.saved
            ) {

                removeActiveSpot();

            }


            showSpot(
                spot
            );

        }
    );

}


