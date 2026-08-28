const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const read = file => readFileSync(resolve(root, file), 'utf8');

test('Ladescreen nutzt nur die Systemschrift und lädt keinen Webfont', () => {
    const html = read('loadingUnit/index.html');
    const css = read('loadingUnit/style.css');
    assert.match(css, /font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;/);
    assert.doesNotMatch(html, /fonts\/|fonts\.css|font-ready\.js|as="font"/);
    assert.doesNotMatch(css, /@font-face|--scapor-font|loader-font-pending/);
    assert.equal(existsSync(resolve(root, 'loadingUnit/font-ready.js')), false);
});

test('Ladescreen lädt die neue Systemschrift-Version ohne Text-Einblendanimation', () => {
    assert.match(read('loadingUnit/index.html'), /href="style\.css\?v=20260828-system-font"/);
    assert.match(read('index.html'), /loadingUnit\/index\.html\?v=20260828-system-font/);
    const css = read('loadingUnit/style.css');
    for (const selector of [/\.loader__content\s*\{[^}]*\}/, /\.loader__copy p\s*\{[^}]*\}/]) {
        const rule = css.match(selector);
        assert.ok(rule);
        assert.doesNotMatch(rule[0], /opacity|transition|animation|visibility/);
    }
    assert.doesNotMatch(read('loadingUnit/script.js'), /document\.fonts|setInterval|is-changing/);
});
