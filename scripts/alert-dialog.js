// ========================================
// SCAPOR HINWEISDIALOG
// ========================================

function showScaporAlert(
    message,
    options = {}
) {

    return new Promise(
        function (resolve) {

            const previousFocus =
                document.activeElement;


            const overlay =
                document.createElement(
                    'div'
                );


            overlay.className =
                'scapor-alert-overlay';

            overlay.setAttribute(
                'role',
                'alertdialog'
            );

            overlay.setAttribute(
                'aria-modal',
                'true'
            );

            overlay.setAttribute(
                'aria-labelledby',
                'scapor-alert-title'
            );

            overlay.setAttribute(
                'aria-describedby',
                'scapor-alert-message'
            );


            const dialog =
                document.createElement(
                    'div'
                );


            dialog.className =
                'scapor-alert-dialog';


            const icon =
                document.createElement(
                    'div'
                );


            icon.className =
                'scapor-alert-icon';

            icon.setAttribute(
                'aria-hidden',
                'true'
            );

            icon.textContent =
                options.icon ||
                'i';


            const title =
                document.createElement(
                    'h2'
                );


            title.id =
                'scapor-alert-title';

            title.textContent =
                options.title ||
                'Hinweis';


            const text =
                document.createElement(
                    'p'
                );


            text.id =
                'scapor-alert-message';

            text.textContent =
                String(
                    message
                );


            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';

            button.className =
                'scapor-alert-confirm';

            button.textContent =
                options.buttonText ||
                'Verstanden';


            dialog.append(
                icon,
                title,
                text,
                button
            );


            overlay.appendChild(
                dialog
            );


            document.body.appendChild(
                overlay
            );


            function closeAlert() {

                overlay.classList.remove(
                    'open'
                );


                document.removeEventListener(
                    'keydown',
                    handleKeydown
                );


                window.setTimeout(
                    function () {

                        overlay.remove();


                        if (
                            previousFocus instanceof
                                HTMLElement
                        ) {

                            previousFocus.focus();

                        }


                        resolve();

                    },
                    180
                );

            }


            function handleKeydown(
                event
            ) {

                if (
                    event.key ===
                    'Escape'
                ) {

                    closeAlert();

                }

            }


            button.addEventListener(
                'click',
                closeAlert
            );


            overlay.addEventListener(
                'click',
                function (event) {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeAlert();

                    }

                }
            );


            document.addEventListener(
                'keydown',
                handleKeydown
            );


            window.requestAnimationFrame(
                function () {

                    overlay.classList.add(
                        'open'
                    );


                    button.focus();

                }
            );

        }
    );

}
