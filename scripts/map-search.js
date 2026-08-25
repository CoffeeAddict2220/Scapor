// ========================================
// ORTSSUCHE EIN-/AUSBLENDEN
// ========================================

let placeSearchControlButton =
    null;


function setPlaceSearchOpen(
    isOpen
) {

    const searchPanel =
        document.getElementById(
            'place-search'
        );


    if (
        !searchPanel
    ) {

        return;

    }


    searchPanel.classList.toggle(
        'place-search-open',
        isOpen
    );

    searchPanel.setAttribute(
        'aria-hidden',
        String(!isOpen)
    );


    placeSearchControlButton?.setAttribute(
        'aria-expanded',
        String(isOpen)
    );


    if (
        isOpen
    ) {

        window.setTimeout(
            function () {

                document.getElementById(
                    'place-search-input'
                )?.focus();

            },
            190
        );

    }

}


const placeSearchControl =
    L.control(
        {
            position:
                'bottomright'
        }
    );


placeSearchControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                'button',
                'leaflet-control leaflet-control-place-search'
            );


        button.type =
            'button';

        button.title =
            'Ort suchen';

        button.setAttribute(
            'aria-label',
            'Ort suchen'
        );

        button.setAttribute(
            'aria-controls',
            'place-search'
        );

        button.setAttribute(
            'aria-expanded',
            'false'
        );

        button.innerHTML =
            `
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m16 16 5 5"></path>
            </svg>
            `;


        placeSearchControlButton =
            button;


        L.DomEvent.disableClickPropagation(
            button
        );

        L.DomEvent.disableScrollPropagation(
            button
        );

        L.DomEvent.on(
            button,
            'click',
            function () {

                window.cancelSpotCreationMode?.();

                closeScaporMapPanels(
                    'search'
                );

                const searchPanel =
                    document.getElementById(
                        'place-search'
                    );


                setPlaceSearchOpen(
                    !searchPanel?.classList.contains(
                        'place-search-open'
                    )
                );

            }
        );


        return button;

    };


placeSearchControl.addTo(
    map
);


const placeSearchCache =
    new Map();


let lastPlaceSearchAt =
    0;


function showPlaceSearchResults(
    results
) {

    const resultsContainer =
        document.getElementById(
            'place-search-results'
        );

    const status =
        document.getElementById(
            'place-search-status'
        );


    if (
        !resultsContainer ||
        !status
    ) {

        return;

    }


    resultsContainer.replaceChildren();


    if (
        results.length ===
        0
    ) {

        status.textContent =
            'Kein passender Ort gefunden.';

        return;

    }


    status.textContent =
        `${results.length} Treffer gefunden`;


    results.forEach(
        function (result) {

            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';

            button.className =
                'place-search-result';

            button.textContent =
                result.display_name;


            button.addEventListener(
                'click',
                function () {

                    const bounds =
                        result.boundingbox?.map(
                            Number
                        );


                    closeScaporMapPanels();


                    if (
                        bounds?.length ===
                        4 &&
                        bounds.every(
                            Number.isFinite
                        )
                    ) {

                        map.fitBounds(
                            [
                                [
                                    bounds[0],
                                    bounds[2]
                                ],
                                [
                                    bounds[1],
                                    bounds[3]
                                ]
                            ],
                            {
                                maxZoom:
                                    16,

                                padding:
                                    [
                                        40,
                                        40
                                    ]
                            }
                        );

                    }

                    else {

                        map.setView(
                            [
                                Number(result.lat),
                                Number(result.lon)
                            ],
                            15
                        );

                    }

                }
            );


            resultsContainer.appendChild(
                button
            );

        }
    );

}


document.getElementById(
    'place-search-form'
)?.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const input =
            document.getElementById(
                'place-search-input'
            );

        const status =
            document.getElementById(
                'place-search-status'
            );

        const submitButton =
            event.currentTarget.querySelector(
                'button[type="submit"]'
            );

        const query =
            input?.value.trim();


        if (
            !query ||
            query.length <
            2
        ) {

            status.textContent =
                'Bitte gib mindestens zwei Zeichen ein.';

            return;

        }


        const cacheKey =
            query.toLocaleLowerCase(
                'de'
            );


        if (
            placeSearchCache.has(
                cacheKey
            )
        ) {

            showPlaceSearchResults(
                placeSearchCache.get(
                    cacheKey
                )
            );

            return;

        }


        submitButton.disabled =
            true;

        status.textContent =
            'Orte werden gesucht …';


        try {

            const remainingDelay =
                Math.max(
                    0,
                    1000 -
                    (
                        Date.now() -
                        lastPlaceSearchAt
                    )
                );


            if (
                remainingDelay >
                0
            ) {

                await new Promise(
                    function (resolve) {

                        window.setTimeout(
                            resolve,
                            remainingDelay
                        );

                    }
                );

            }


            const parameters =
                new URLSearchParams(
                    {
                        q:
                            query,

                        format:
                            'jsonv2',

                        limit:
                            '5',

                        addressdetails:
                            '0',

                        'accept-language':
                            'de'
                    }
                );


            lastPlaceSearchAt =
                Date.now();


            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/search?${parameters}`,
                    {
                        headers:
                            {
                                Accept:
                                    'application/json'
                            }
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    'Place search failed'
                );

            }


            const results =
                await response.json();


            placeSearchCache.set(
                cacheKey,
                results
            );


            showPlaceSearchResults(
                results
            );

        }

        catch (error) {

            console.error(
                'Ortssuche fehlgeschlagen:',
                error
            );

            status.textContent =
                'Die Ortssuche ist gerade nicht erreichbar. Bitte versuche es später erneut.';

        }

        finally {

            submitButton.disabled =
                false;

        }

    }
);
