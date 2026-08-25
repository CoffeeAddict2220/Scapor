// ========================================
// KARTENLAYER
// ========================================


// ========================================
// NORMALE KARTENANSICHT
// ========================================

const streetMap =
    L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
                '&copy; OpenStreetMap contributors',

            noWrap:
                true
        }
    );


// ========================================
// SATELLITENANSICHT
// ========================================

const satelliteMap =
    L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution:
                'Tiles &copy; Esri',

            noWrap:
                true
        }
    );


// ========================================
// SATELLITEN-BESCHRIFTUNGEN
// ========================================

map.createPane(
    'satelliteLabels'
);


map.getPane(
    'satelliteLabels'
).style.zIndex =
    650;


map.getPane(
    'satelliteLabels'
).style.pointerEvents =
    'none';


const satelliteLabels =
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
            subdomains:
                [
                    'a',
                    'b',
                    'c',
                    'd'
                ],

            maxZoom:
                20,

            maxNativeZoom:
                20,

            pane:
                'satelliteLabels',

            opacity:
                1,

            noWrap:
                true,

            attribution:
                '&copy; OpenStreetMap contributors &copy; CARTO'
        }
    );


// ========================================
// STANDARDKARTE AKTIVIEREN
// ========================================

streetMap.addTo(
    map
);


// ========================================
// BASEMAP AUSWAHL
// ========================================

const baseMaps = {

    'Karte':
        streetMap,

    'Satellit':
        satelliteMap

};


// ========================================
// LAYER CONTROL
// ========================================

const layerControl =
    L.control.layers(
        baseMaps,
        null,
        {
            collapsed:
                true,

            position:
                'bottomright'
        }
    ).addTo(
        map
    );


// ========================================
// KARTENAUSWAHL NUR PER KLICK ÖFFNEN
// ========================================

const layerControlContainer =
    layerControl.getContainer();


function closeScaporMapPanels(
    exceptPanel
) {

    if (
        exceptPanel !==
        'search'
    ) {

        setPlaceSearchOpen(
            false
        );

    }

    if (
        exceptPanel !==
        'filter'
    ) {

        setCategoryFilterOpen(
            false
        );

    }


    if (
        exceptPanel !==
        'list'
    ) {

        window.setSpotListOpen?.(
            false
        );

    }


    if (
        exceptPanel !==
        'layers'
    ) {

        layerControl.collapse();

    }


    if (
        exceptPanel !== 'tools' &&
        exceptPanel !== 'layers'
    ) {

        window.setMapToolsOpen?.(
            false
        );

    }


    if (
        exceptPanel !==
        'navigation'
    ) {

        window.closeScaporNavigationMenus?.();

    }

}


window.closeScaporMapPanels =
    closeScaporMapPanels;


let scaporPanelWasOpenOnPointerDown =
    false;


function closeOpenScaporPanelsBeforeMapAction() {

    const filterIsOpen =
        document.getElementById(
            'category-filter'
        )?.classList.contains(
            'category-filter-open'
        ) ||
        false;


    const searchIsOpen =
        document.getElementById(
            'place-search'
        )?.classList.contains(
            'place-search-open'
        ) ||
        false;


    const listIsOpen =
        document.getElementById(
            'spot-list-panel'
        )?.classList.contains(
            'spot-list-panel-open'
        ) ||
        false;


    const toolsAreOpen =
        document.querySelector(
            '.leaflet-bottom.leaflet-right'
        )?.classList.contains(
            'map-tools-open'
        ) ||
        false;


    const layersAreOpen =
        layerControlContainer.classList.contains(
            'leaflet-control-layers-expanded'
        );


    const navigationIsOpen =
        Array.from(
            document.querySelectorAll(
                '.navigation-menu'
            )
        ).some(
            function (menu) {

                return menu.open;

            }
        );


    const panelWasOpen =
        scaporPanelWasOpenOnPointerDown;


    scaporPanelWasOpenOnPointerDown =
        false;


    if (
        !filterIsOpen &&
        !searchIsOpen &&
        !listIsOpen &&
        !toolsAreOpen &&
        !layersAreOpen &&
        !navigationIsOpen &&
        !panelWasOpen
    ) {

        return false;

    }


    closeScaporMapPanels();

    return true;

}


window.closeOpenScaporPanelsBeforeMapAction =
    closeOpenScaporPanelsBeforeMapAction;


map.getContainer().addEventListener(
    'pointerdown',
    function (event) {

        if (
            event.target.closest(
                '.leaflet-control, .leaflet-popup'
            )
        ) {

            scaporPanelWasOpenOnPointerDown =
                false;

            return;

        }


        scaporPanelWasOpenOnPointerDown =
            document.getElementById(
                'category-filter'
            )?.classList.contains(
                'category-filter-open'
            ) ||
            document.getElementById(
                'place-search'
            )?.classList.contains(
                'place-search-open'
            ) ||
            document.getElementById(
                'spot-list-panel'
            )?.classList.contains(
                'spot-list-panel-open'
            ) ||
            document.querySelector(
                '.leaflet-bottom.leaflet-right'
            )?.classList.contains(
                'map-tools-open'
            ) ||
            layerControlContainer.classList.contains(
                'leaflet-control-layers-expanded'
            ) ||
            Array.from(
                document.querySelectorAll(
                    '.navigation-menu'
                )
            ).some(
                function (menu) {

                    return menu.open;

                }
            );

    },
    true
);


L.DomEvent.off(
    layerControlContainer,
    'mouseenter',
    layerControl._expandSafely,
    layerControl
);


// Kompatibilität mit Leaflet-Versionen,
// die direkt expand statt _expandSafely verwenden.

L.DomEvent.off(
    layerControlContainer,
    'mouseenter',
    layerControl.expand,
    layerControl
);


L.DomEvent.off(
    layerControlContainer,
    'mouseleave',
    layerControl.collapse,
    layerControl
);


layerControlContainer.addEventListener(
    'click',
    function (event) {

        window.cancelSpotCreationMode?.();

        closeScaporMapPanels(
            'layers'
        );

        if (
            !event.target.matches(
                '.leaflet-control-layers-selector'
            )
        ) {

            return;

        }


        window.setTimeout(
            function () {

                layerControl.collapse();
                window.setMapToolsOpen?.(
                    false
                );

            },
            0
        );

    }
);
