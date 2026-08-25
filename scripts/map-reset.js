// ========================================
// KARTENANSICHT ZURÜCKSETZEN
// ========================================

const resetViewControl =
    L.control(
        {
            position:
                "bottomright"
        }
    );


resetViewControl.onAdd =
    function () {

        const button =
            L.DomUtil.create(
                "button",
                "leaflet-control leaflet-control-reset-view"
            );


        button.type =
            "button";

        button.title =
            "Vollständige Kartenansicht anzeigen";

        button.setAttribute(
            "aria-label",
            "Vollständige Kartenansicht anzeigen"
        );

        button.innerHTML =
            `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></svg>`;


        L.DomEvent.disableClickPropagation(
            button
        );

        L.DomEvent.disableScrollPropagation(
            button
        );

        L.DomEvent.on(
            button,
            "click",
            function () {

                closeScaporMapPanels();

                map.setView(
                    [
                        51.1657,
                        10.4515
                    ],
                    6
                );

            }
        );


        return button;

    };


resetViewControl.addTo(
    map
);
