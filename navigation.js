// ========================================
// SCAPOR NAVIGATION
// ========================================

(function () {

    const navigationMenus =
        document.querySelectorAll(
            '.navigation-menu'
        );


    if (
        navigationMenus.length ===
        0
    ) {

        return;

    }


    document.addEventListener(
        'pointerdown',
        function (event) {

            navigationMenus.forEach(
                function (menu) {

                    if (
                        menu.open &&
                        !menu.contains(
                            event.target
                        )
                    ) {

                        menu.removeAttribute(
                            'open'
                        );

                    }

                }
            );

        }
    );


    document.addEventListener(
        'keydown',
        function (event) {

            if (
                event.key !==
                'Escape'
            ) {

                return;

            }


            navigationMenus.forEach(
                function (menu) {

                    if (
                        !menu.open
                    ) {

                        return;

                    }


                    menu.removeAttribute(
                        'open'
                    );


                    menu.querySelector(
                        'summary'
                    )?.focus();

                }
            );

        }
    );

})();
