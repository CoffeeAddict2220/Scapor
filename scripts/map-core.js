// ========================================
// KARTE
// ========================================

const map =
    L.map(
        'map',
        {
            zoomControl:
                false,

            worldCopyJump:
                false,

            maxBounds:
                [
                    [
                        -85,
                        -180
                    ],
                    [
                        85,
                        180
                    ]
                ],

            maxBoundsViscosity:
                1.0
        }
    ).setView(
        [
            51.1657,
            10.4515
        ],
        6
    );


map.attributionControl.setPosition(
    "bottomleft"
);


// ========================================
// ICONS
// ========================================

function createActiveIcon() {

    return L.divIcon({

        className:
            'scapor-marker-wrapper',

        html:
            `
            <div class="scapor-marker active-marker">
                <div class="marker-dot"></div>
            </div>
            `,

        iconSize:
            [
                30,
                30
            ],

        iconAnchor:
            [
                15,
                15
            ],

        popupAnchor:
            [
                0,
                -18
            ]

    });

}


function createSavedIcon() {

    return L.divIcon({

        className:
            'scapor-marker-wrapper',

        html:
            `
            <div class="scapor-marker saved-marker">
                <div class="marker-dot"></div>
            </div>
            `,

        iconSize:
            [
                30,
                30
            ],

        iconAnchor:
            [
                15,
                15
            ],

        popupAnchor:
            [
                0,
                -18
            ]

    });

}
