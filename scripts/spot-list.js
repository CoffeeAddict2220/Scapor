// ========================================
// SPOT-LISTE
// ========================================

let spotListControlButton = null;
let spotListUserPosition = null;

function setSpotListOpen(isOpen) {
    const panel = document.getElementById('spot-list-panel');

    if (!panel) {
        return;
    }

    panel.classList.toggle('spot-list-panel-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
    spotListControlButton?.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
        renderSpotList();
    }
}

window.setSpotListOpen = setSpotListOpen;

function formatSpotDistance(distance) {
    if (distance < 1000) {
        return `${Math.round(distance)} m`;
    }

    return `${(distance / 1000).toFixed(1)} km`;
}

function updateSpotListLocation(position) {
    if (
        !position ||
        !Number.isFinite(position.lat) ||
        !Number.isFinite(position.lng)
    ) {
        return;
    }

    spotListUserPosition = L.latLng(position);

    document
        .querySelector('#spot-list-sort option[value="distance"]')
        ?.removeAttribute('disabled');

    const status = document.getElementById('spot-list-status');

    if (status) {
        status.textContent =
            'Entfernungen werden von deinem Standort berechnet.';
    }

    renderSpotList();
}

window.updateSpotListLocation = updateSpotListLocation;

function renderSpotList() {
    const list = document.getElementById('spot-list');
    const sortSelect = document.getElementById('spot-list-sort');

    if (!list || !sortSelect) {
        return;
    }

    const listSpots = spots
        .filter(function (spot) {
            return Boolean(
                spot?.saved &&
                spot.marker &&
                spotMatchesCategory(spot, selectedCategory)
            );
        })
        .map(function (spot) {
            return {
                spot,
                distance: spotListUserPosition
                    ? map.distance(
                        spotListUserPosition,
                        spot.marker.getLatLng()
                    )
                    : null
            };
        });

    const sortMode = sortSelect.value;

    listSpots.sort(function (first, second) {
        if (sortMode === 'distance' && spotListUserPosition) {
            return first.distance - second.distance;
        }

        if (sortMode === 'category') {
            const categoryResult =
                first.spot.category.localeCompare(
                    second.spot.category,
                    'de'
                );

            if (categoryResult !== 0) {
                return categoryResult;
            }
        }

        return (first.spot.name || '').localeCompare(
            second.spot.name || '',
            'de'
        );
    });

    list.replaceChildren();

    if (listSpots.length === 0) {
        const emptyItem = document.createElement('li');

        emptyItem.className = 'spot-list-empty';
        emptyItem.textContent =
            selectedCategory === 'all'
                ? 'Noch keine gespeicherten Spots vorhanden.'
                : 'Keine Spots in dieser Kategorie gefunden.';

        list.append(emptyItem);
        return;
    }

    listSpots.forEach(function ({ spot, distance }) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        const name = document.createElement('strong');
        const details = document.createElement('span');

        button.type = 'button';
        button.className = 'spot-list-item';

        name.textContent = spot.name || 'Unbenannter Spot';

        details.className = 'spot-list-item-details';
        const categoryText = getSpotCategories(spot).join(', ');
        details.textContent =
            distance === null
                ? categoryText
                : `${categoryText} · ${formatSpotDistance(distance)}`;

        button.append(name, details);

        button.addEventListener('click', function () {
            if (activeSpot && !activeSpot.saved) {
                removeActiveSpot();
            }

            setSpotListOpen(false);

            map.setView(
                spot.marker.getLatLng(),
                Math.max(map.getZoom(), 14)
            );

            showSpot(spot);
        });

        item.append(button);
        list.append(item);
    });
}

window.renderSpotList = renderSpotList;

function setupSpotList() {
    const panel = document.getElementById('spot-list-panel');
    const sortSelect = document.getElementById('spot-list-sort');

    if (panel) {
        L.DomEvent.disableClickPropagation(panel);
        L.DomEvent.disableScrollPropagation(panel);
    }

    sortSelect?.addEventListener('change', renderSpotList);
    renderSpotList();
}

const spotListControl = L.control({
    position: 'bottomright'
});

spotListControl.onAdd = function () {
    const button = L.DomUtil.create(
        'button',
        'leaflet-control leaflet-control-spot-list'
    );

    button.type = 'button';
    button.title = 'Gespeicherte Spots als Liste anzeigen';
    button.setAttribute(
        'aria-label',
        'Gespeicherte Spots als Liste anzeigen'
    );
    button.setAttribute('aria-controls', 'spot-list-panel');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M8 6h13"></path>
            <path d="M8 12h13"></path>
            <path d="M8 18h13"></path>
            <circle cx="3.5" cy="6" r="0.7" fill="currentColor"></circle>
            <circle cx="3.5" cy="12" r="0.7" fill="currentColor"></circle>
            <circle cx="3.5" cy="18" r="0.7" fill="currentColor"></circle>
        </svg>
    `;

    spotListControlButton = button;

    L.DomEvent.disableClickPropagation(button);

    L.DomEvent.on(button, 'click', function () {
        window.cancelSpotCreationMode?.();

        const isOpen =
            document
                .getElementById('spot-list-panel')
                ?.classList.contains('spot-list-panel-open') ||
            false;

        closeScaporMapPanels('list');
        setSpotListOpen(!isOpen);
    });

    return button;
};

spotListControl.addTo(map);
setupSpotList();
