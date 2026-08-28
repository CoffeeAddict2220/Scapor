/* Vor dem ersten Rendern warten, damit keine Ersatzschrift aufblitzt. */
(() => {
    const root = document.documentElement;
    let settled = false;
    let timeout;

    function reveal(useFallback) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);

        // Bei Ladefehlern lesbar bleiben, ohne später nochmals die Schrift zu wechseln.
        if (useFallback) root.style.setProperty('--scapor-font', 'sans-serif');
        root.classList.remove('loader-font-pending');
    }

    if (!document.fonts?.load) {
        reveal(true);
        return;
    }

    root.classList.add('loader-font-pending');
    timeout = window.setTimeout(() => reveal(true), 2000);

    const markupReady = document.readyState === 'loading'
        ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
        : Promise.resolve();

    // Die variable Datei enthält alle auf dem Ladescreen verwendeten Schriftstärken.
    try {
        Promise.all([document.fonts.load('800 20px "Inter"'), markupReady])
            .then(async ([fonts]) => {
                if (!fonts.length) {
                    reveal(true);
                    return;
                }
                await document.fonts.ready;
                // Erst das fertige Layout zeichnen, dann ohne Textanimation zeigen.
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => reveal(false));
                });
            })
            .catch(() => reveal(true));
    } catch {
        reveal(true);
    }
})();
