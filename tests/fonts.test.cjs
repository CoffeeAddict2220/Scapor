const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { resolve, dirname } = require('node:path');

const root = resolve(__dirname, '..');
const read = path => readFileSync(resolve(root, path), 'utf8');

test('Alle HTML-Einstiege außer dem Ladescreen verwenden dieselbe lokale Schriftdefinition', () => {
    for (const page of [
        'index.html', 'spots.html', 'about/index.html', 'contact/index.html',
        'imprint/index.html', 'privacy/index.html', 'terms/index.html',
        'welcome/index.html'
    ]) {
        const match = read(page).match(/<link\b[^>]*href="([^"]*styles\/fonts\.css)"[^>]*>/);
        assert.ok(match, `${page}: Schriftdefinition fehlt`);
        assert.equal(resolve(root, dirname(page), match[1]), resolve(root, 'styles/fonts.css'));
    }
});

test('Normale und kursive Inter-Dateien sind lokal und als WOFF2 vorhanden', () => {
    const css = read('styles/fonts.css');
    const sources = [...css.matchAll(/src:\s*url\("([^"]+)"\)/g)];
    assert.equal(sources.length, 2);
    for (const [, source] of sources) {
        assert.ok(!/^https?:/.test(source));
        const font = readFileSync(resolve(root, 'styles', source));
        assert.equal(font.subarray(0, 4).toString(), 'wOF2');
    }
    assert.match(css, /font-style: normal/);
    assert.match(css, /font-style: italic/);
    assert.equal((css.match(/font-weight: 100 900/g) || []).length, 2);
    assert.match(read('fonts/LICENSE.txt'), /SIL OPEN FONT LICENSE/);
});

test('Eigene Styles außerhalb des Ladescreens verwenden weiterhin Inter', () => {
    for (const directory of ['styles', 'welcome']) {
        for (const file of readdirSync(resolve(root, directory)).filter(name => name.endsWith('.css'))) {
            const css = read(`${directory}/${file}`);
            for (const [, family] of css.matchAll(/font-family:\s*([^;]+);/g)) {
                assert.ok(['"Inter"', 'inherit', 'var(--scapor-font)'].includes(family.trim()),
                    `${directory}/${file}: abweichende Schrift ${family}`);
            }
        }
    }
});
