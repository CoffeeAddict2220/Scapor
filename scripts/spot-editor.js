// ========================================
// MOBILE POPUP-POSITION
// ========================================

function positionSpotPopupOnMobile(
    spot,
    popup
) {

    if (
        !spot?.marker ||
        !popup ||
        !window.matchMedia(
            '(max-width: 600px)'
        ).matches
    ) {

        return;

    }


    window.setTimeout(
        function () {

            const popupElement =
                popup.getElement();


            if (
                !popupElement
            ) {

                return;

            }


            const popupContent =
                popupElement.querySelector(
                    '.leaflet-popup-content-wrapper'
                );


            const popupHeight =
                (
                    popupContent ||
                    popupElement
                ).getBoundingClientRect().height;


            const mapSize =
                map.getSize();


            const markerPoint =
                map.latLngToContainerPoint(
                    spot.marker.getLatLng()
                );


            const centeredPopupPosition =
                mapSize.y / 2 +
                popupHeight / 2 +
                12;


            const targetY =
                Math.min(
                    mapSize.y - 80,
                    Math.max(
                        mapSize.y / 2 + 40,
                        centeredPopupPosition
                    )
                );


            const targetPoint =
                L.point(
                    mapSize.x / 2,
                    targetY
                );


            map.panBy(
                markerPoint.subtract(
                    targetPoint
                ),
                {
                    animate:
                        true,

                    duration:
                        0.28
                }
            );

        },
        0
    );

}


// ========================================
// UNGESPEICHERTEN SPOT BEIM SCHLIESSEN ENTFERNEN
// ========================================

function setupUnsavedSpotCloseButton(
    spot,
    popup
) {

    if (
        !spot ||
        spot.saved ||
        !popup
    ) {

        return;

    }


    const closeButton =
        popup.getElement()?.querySelector(
            ".leaflet-popup-close-button"
        );


    if (
        !closeButton
    ) {

        return;

    }


    closeButton.addEventListener(
        "click",
        function () {

            if (
                !spot.saved &&
                activeSpot === spot
            ) {

                removeActiveSpot();

            }

        },
        {
            once:
                true
        }
    );

}


// ========================================
// EDITOR
// ========================================


async function openEditor(
    spot
) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    try {

        await loadSpotTemplates();


        if (
            !spot.saved &&
            activeSpot !== spot
        ) {

            return;

        }


        const form =
            createTemplateElement(
                spotEditorTemplate
            );


        if (
            !form
        ) {

            console.error(
                'Spot-Editor konnte nicht aus dem Template erstellt werden.'
            );

            return;

        }


        form.dataset.openedAt =
            String(
                Date.now()
            );


        const editorTitle =
            form.querySelector(
                '.spot-editor-title'
            );


        if (
            editorTitle
        ) {

            editorTitle.textContent =
                spot.saved
                    ? 'Spot bearbeiten:'
                    : 'Neuen Spot erstellen:';

        }


        const nameInput =
            form.querySelector(
                '.spot-name'
            );


        const descriptionInput =
            form.querySelector(
                '.spot-description'
            );


        if (
            nameInput
        ) {

            nameInput.value =
                spot.name ||
                '';

        }


        if (
            descriptionInput
        ) {

            descriptionInput.value =
                spot.description ||
                '';

        }


        setupSpotCategoryInputs(form, spot);


        spot.marker.unbindPopup();


        spot.marker.bindPopup(
            form,
            {
                closeButton:
                    true,

                closeOnClick:
                    false,

                autoPan:
                    true,

                autoPanPadding:
                    [
                        110,
                        90
                    ],

                className:
                    'scapor-popup scapor-popup-editor',

                maxWidth:
                    340
            }
        );


        spot.marker.once(
            'popupopen',
            function (event) {

                positionSpotPopupOnMobile(
                    spot,
                    event.popup
                );


                setupEditorPopup(
                    spot,
                    event.popup
                );


                setupUnsavedSpotCloseButton(
                    spot,
                    event.popup
                );

            }
        );


        spot.marker.openPopup();

    }

    catch (error) {

        console.error(
            'Fehler beim Öffnen des Spot-Editors:',
            error
        );

    }

}


// ========================================
// EDITOR POPUP EINRICHTEN
// ========================================

function setupSpotCategoryInputs(form, spot) {
    const primary = form.querySelector('.spot-category');
    const extras = [...form.querySelectorAll('.spot-category-extra')];
    const chips = form.querySelector('.spot-category-chips');
    const count = form.querySelector('.spot-category-count');
    const picker = form.querySelector('.spot-category-picker');
    if (!primary || !chips || !count || !picker) return;

    const categories = [...picker.options].map(option => option.value).filter(Boolean);
    const additional = Array.isArray(spot.additionalCategories) ? spot.additionalCategories : [];
    let selected = [...new Set([spot.category, ...additional])]
        .filter(category => categories.includes(category)).slice(0, 3);
    const buttons = new Map();

    function updateSelection() {
        // Die gemeinsame Auswahl bleibt mit dem bisherigen Datenformat kompatibel.
        primary.value = selected[0] || '';
        spot.category = primary.value;
        spot.additionalCategories = selected.slice(1);
        // Die bestehenden Speicher- und Validierungsfunktionen lesen diese Felder.
        extras.forEach((input, index) => { input.value = selected[index + 1] || ''; });
        count.textContent = `${selected.length} von 3`;
        picker.value = '';
        picker.hidden = selected.length === 3;
        picker.options[0].textContent = selected.length
            ? 'Kategorie hinzufügen (optional)'
            : 'Kategorie auswählen';
        [...picker.options].forEach(function (option) {
            option.disabled = Boolean(option.value &&
                selected.includes(option.value));
        });
        chips.hidden = selected.length === 0;
        buttons.forEach(function (button, category) {
            button.hidden = !selected.includes(category);
        });
    }

    function updateCategoryPopup() {
        const popup = spot.marker?.getPopup();
        if (popup) {
            popup.update();
            positionSpotPopupOnMobile(spot, popup);
        }
    }

    chips.replaceChildren();
    categories.forEach(function (category) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'spot-category-chip';
        button.textContent = category;
        button.setAttribute('aria-label', `${category} entfernen`);
        button.title = `${category} entfernen`;
        button.addEventListener('click', function () {
            selected = selected.filter(value => value !== category);
            updateSelection();
            updateCategoryPopup();
            picker.focus();
        });
        buttons.set(category, button);
        chips.append(button);
    });

    picker.addEventListener('change', function () {
        const category = picker.value;
        if (categories.includes(category) && !selected.includes(category) && selected.length < 3) {
            selected.push(category);
        }
        updateSelection();
        updateCategoryPopup();
        if (picker.hidden) buttons.get(selected[selected.length - 1])?.focus();
    });

    updateSelection();
}

function setupEditorPopup(
    spot,
    popup
) {

    if (
        !popup
    ) {

        return;

    }


    const popupElement =
        popup.getElement();


    if (
        !popupElement
    ) {

        return;

    }


    const saveButton =
        popupElement.querySelector(
            '.spot-save'
        );


    if (
        !saveButton
    ) {

        console.error(
            'Speichern-Button wurde nicht gefunden.'
        );

        return;

    }


    saveButton.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            saveSpot(
                spot
            );

        }
    );

}


// ========================================
// POPUP ERSTELLEN
// ========================================

function markerPopup(
    spot,
    html,
    onOpen
) {

    if (
        !spot ||
        !spot.marker
    ) {

        return;

    }


    spot.marker.unbindPopup();


    spot.marker.bindPopup(
        html,
        {
            closeButton:
                true,

            closeOnClick:
                false,

            autoPan:
                true,

            autoPanPadding:
                [
                    110,
                    90
                ],

            className:
                'scapor-popup scapor-popup-info',

            maxWidth:
                340
        }
    );


    if (
        typeof onOpen ===
        'function'
    ) {

        spot.marker.once(
            'popupopen',
            function (event) {

                positionSpotPopupOnMobile(
                    spot,
                    event.popup
                );


                onOpen(
                    event.popup
                );

            }
        );

    }


    spot.marker.openPopup();

}
