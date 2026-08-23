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


        const categoryInput =
            form.querySelector(
                '.spot-category'
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


        if (
            categoryInput
        ) {

            categoryInput.value =
                spot.category ||
                'Architecture';

        }


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

                setupEditorPopup(
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


    const category =
        popupElement.querySelector(
            '.spot-category'
        );


    if (
        category
    ) {

        category.value =
            spot.category;

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

                onOpen(
                    event.popup
                );

            }
        );

    }


    spot.marker.openPopup();

}


