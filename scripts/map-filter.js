// ========================================
// KATEGORIE-FILTER EIN-/AUSBLENDEN
// ========================================

let categoryFilterControlButton =
    null;


function setCategoryFilterOpen(
    isOpen
) {

    const filter =
        document.getElementById(
            'category-filter'
        );


    if (
        !filter
    ) {

        return;

    }


    filter.classList.toggle(
        'category-filter-open',
        isOpen
    );


    filter.setAttribute(
        'aria-hidden',
        String(!isOpen)
    );


    if (
        categoryFilterControlButton
    ) {

        categoryFilterControlButton.setAttribute(
            'aria-expanded',
            String(isOpen)
        );

    }

}


const categoryFilterControl =
    L.control(
        {
            position:
                'bottomright'
        }
    );


categoryFilterControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                'button',
                'leaflet-control leaflet-control-category-filter'
            );


        button.type =
            'button';

        button.title =
            'Spot-Kategorien filtern';

        button.setAttribute(
            'aria-label',
            'Spot-Kategorien filtern'
        );

        button.setAttribute(
            'aria-controls',
            'category-filter'
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
                stroke-linejoin="round"
            >
                <path d="M4 5h16"></path>
                <path d="M7 12h10"></path>
                <path d="M10 19h4"></path>
            </svg>
            `;


        categoryFilterControlButton =
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
                    'filter'
                );

                const filter =
                    document.getElementById(
                        'category-filter'
                    );


                setCategoryFilterOpen(
                    !filter?.classList.contains(
                        'category-filter-open'
                    )
                );

            }
        );


        return button;

    };


categoryFilterControl.addTo(
    map
);
