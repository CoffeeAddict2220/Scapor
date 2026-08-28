const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');

const root = resolve(__dirname, '..');
const read = file => readFileSync(resolve(root, file), 'utf8');

function setup(load, readyState = 'complete') {
    const classes = new Set();
    const properties = new Map();
    let expire;
    let cleared = false;
    const frames = [];
    let markupComplete;
    runInNewContext(read('loadingUnit/font-ready.js'), {
        document: {
            fonts: load ? { load, ready: Promise.resolve() } : undefined,
            readyState,
            addEventListener(event, callback) { assert.equal(event, 'DOMContentLoaded'); markupComplete = callback; },
            documentElement: {
                classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
                style: { setProperty: (key, value) => properties.set(key, value) }
            }
        },
        window: {
            setTimeout(callback, delay) { assert.equal(delay, 2000); expire = callback; return 1; },
            clearTimeout() { cleared = true; },
            requestAnimationFrame(callback) { frames.push(callback); }
        }
    });
    return { classes, properties, frames, finishMarkup: () => markupComplete(), frame: () => frames.shift()(), expire: () => expire(), cleared: () => cleared };
}

const flushPromises = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

test('Ladescreen wartet ohne Einblendanimation und lädt die aktualisierten Dateien', () => {
    const html = read('loadingUnit/index.html');
    assert.match(html, /href="style\.css\?v=20260828-static-text"/);
    assert.match(html.split('<body>')[0], /<script src="font-ready\.js\?v=20260828-static-text"><\/script>/);
    assert.match(read('index.html'), /loadingUnit\/index\.html\?v=20260828-static-text/);
    const css = read('loadingUnit/style.css');
    assert.match(css, /\.loader-font-pending \.loader__content\s*\{\s*visibility: hidden;/);
    assert.doesNotMatch(css.match(/\.loader__content\s*\{[^}]*\}/)[0], /opacity|transition|animation/);
    assert.doesNotMatch(css.match(/\.loader__copy p\s*\{[^}]*\}/)[0], /opacity|transition|animation/);
    assert.doesNotMatch(read('loadingUnit/script.js'), /setInterval|is-changing/);
});

test('Ladescreen erscheint erst nach geladener Inter-Schrift', async () => {
    let complete;
    const state = setup(font => {
        assert.equal(font, '800 20px "Inter"');
        return new Promise(resolve => { complete = resolve; });
    });
    assert.ok(state.classes.has('loader-font-pending'));
    complete([{}]);
    await flushPromises();
    assert.ok(state.classes.has('loader-font-pending'));
    state.frame();
    assert.ok(state.classes.has('loader-font-pending'));
    state.frame();
    assert.ok(!state.classes.has('loader-font-pending'));
    assert.equal(state.properties.size, 0);
    assert.ok(state.cleared());
});

test('Langsames Laden zeigt nach Timeout eine stabile Ersatzschrift, auch bei spätem Erfolg', async () => {
    let complete;
    const state = setup(() => new Promise(resolve => { complete = resolve; }));
    state.expire();
    assert.ok(!state.classes.has('loader-font-pending'));
    assert.equal(state.properties.get('--scapor-font'), 'sans-serif');
    complete([{}]);
    await flushPromises();
    state.frame();
    state.frame();
    assert.equal(state.properties.get('--scapor-font'), 'sans-serif');
});

test('Fehlende Font-API, Ladefehler und fehlende Schrift lassen den Ladescreen sichtbar', async () => {
    for (const load of [undefined, () => Promise.reject(new Error('offline')), () => Promise.resolve([]), () => { throw new Error('load failed'); }]) {
        const state = setup(load);
        await flushPromises();
        assert.ok(!state.classes.has('loader-font-pending'));
        assert.equal(state.properties.get('--scapor-font'), 'sans-serif');
    }
});

test('Bereits geladene Schrift wird nicht vor vollständigem HTML und Layout eingeblendet', async () => {
    const state = setup(() => Promise.resolve([{}]), 'loading');
    await flushPromises();
    assert.equal(state.frames.length, 0);
    assert.ok(state.classes.has('loader-font-pending'));
    state.finishMarkup();
    await flushPromises();
    state.frame();
    state.frame();
    assert.ok(!state.classes.has('loader-font-pending'));
});
