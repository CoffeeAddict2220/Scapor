// ========================================
// AUSKLAPPBARE KARTENWERKZEUGE
// ========================================

let mapToolsControlButton = null;
let mapToolsItems = null;

function setMapToolsOpen(isOpen) {
    const controlsContainer =
        document.querySelector('.leaflet-bottom.leaflet-right');

    if (!controlsContainer || !mapToolsItems) {
        return;
    }

    controlsContainer.classList.toggle(
        'map-tools-open',
        isOpen
    );

    mapToolsControlButton?.setAttribute(
        'aria-expanded',
        String(isOpen)
    );

    if (mapToolsControlButton) {
        const label =
            isOpen
                ? 'Kartenwerkzeuge schließen'
                : 'Kartenwerkzeuge anzeigen';

        mapToolsControlButton.title = label;
        mapToolsControlButton.setAttribute(
            'aria-label',
            label
        );
    }

    mapToolsItems.inert = !isOpen;
    mapToolsItems.setAttribute(
        'aria-hidden',
        String(!isOpen)
    );
}

window.setMapToolsOpen = setMapToolsOpen;

function setupMapToolsItems() {
    const controlsContainer =
        document.querySelector('.leaflet-bottom.leaflet-right');

    if (!controlsContainer || !mapToolsControlButton) {
        return;
    }

    mapToolsItems =
        document.createElement('div');

    mapToolsItems.className =
        'map-tools-items';

    const controls =
        Array.from(
            controlsContainer.children
        ).filter(
            function (control) {
                return (
                    control !== mapToolsControlButton &&
                    control.classList.contains(
                        'leaflet-control'
                    )
                );
            }
        );

    controls.forEach(
        function (control) {
            mapToolsItems.append(control);
        }
    );

    controlsContainer.append(
        mapToolsItems
    );
}

const mapToolsControl = L.control({
    position: 'bottomright'
});

mapToolsControl.onAdd = function () {
    const button = L.DomUtil.create(
        'button',
        'leaflet-control leaflet-control-map-tools'
    );

    button.type = 'button';
    button.title = 'Kartenwerkzeuge anzeigen';
    button.setAttribute(
        'aria-label',
        'Kartenwerkzeuge anzeigen'
    );
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <g class="map-tools-settings-icon">
                <path d="M4 7h10"></path>
                <circle cx="17" cy="7" r="2"></circle>
                <path d="M10 17h10"></path>
                <circle cx="7" cy="17" r="2"></circle>
            </g>
            <g class="map-tools-close-icon">
                <path d="M6 6l12 12"></path>
                <path d="M18 6L6 18"></path>
            </g>
        </svg>
    `;

    mapToolsControlButton = button;

    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.disableScrollPropagation(button);

    L.DomEvent.on(button, 'click', function () {
        const controlsContainer =
            document.querySelector(
                '.leaflet-bottom.leaflet-right'
            );

        const isOpen =
            controlsContainer?.classList.contains(
                'map-tools-open'
            ) ||
            false;

        closeScaporMapPanels('tools');
        setMapToolsOpen(!isOpen);
    });

    return button;
};

mapToolsControl.addTo(map);
setupMapToolsItems();
setMapToolsOpen(false);
