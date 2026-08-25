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


    const closeTimers =
        new WeakMap();


    function closeNavigationMenu(
        menu
    ) {

        if (
            !menu.open ||
            menu.classList.contains(
                'navigation-menu-closing'
            )
        ) {

            return;

        }


        if (
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches
        ) {

            menu.removeAttribute(
                'open'
            );

            return;

        }


        menu.classList.add(
            'navigation-menu-closing'
        );


        const timer =
            window.setTimeout(
                function () {

                    menu.removeAttribute(
                        'open'
                    );

                    menu.classList.remove(
                        'navigation-menu-closing'
                    );

                    closeTimers.delete(
                        menu
                    );

                },
                160
            );


        closeTimers.set(
            menu,
            timer
        );

    }


    window.closeScaporNavigationMenus =
        function () {

            navigationMenus.forEach(
                function (menu) {

                    closeNavigationMenu(
                        menu
                    );

                }
            );

        };


    navigationMenus.forEach(
        function (menu) {

            const summary =
                menu.querySelector(
                    'summary'
                );


            summary?.addEventListener(
                'click',
                function (event) {

                    event.preventDefault();
                    window.cancelSpotCreationMode?.();


                    if (
                        menu.open
                    ) {

                        closeNavigationMenu(
                            menu
                        );

                        return;

                    }


                    const runningTimer =
                        closeTimers.get(
                            menu
                        );


                    if (
                        runningTimer
                    ) {

                        window.clearTimeout(
                            runningTimer
                        );

                    }


                    menu.classList.remove(
                        'navigation-menu-closing'
                    );


                    window.closeScaporMapPanels?.(
                        'navigation'
                    );

                    menu.setAttribute(
                        'open',
                        ''
                    );

                }
            );

        }
    );


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

                        closeNavigationMenu(
                            menu
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


                    closeNavigationMenu(
                        menu
                    );


                    menu.querySelector(
                        'summary'
                    )?.focus();

                }
            );

        }
    );

})();
