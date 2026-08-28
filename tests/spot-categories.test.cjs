const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

const root = join(__dirname, '..');
const source = file => readFileSync(join(root, file), 'utf8');
function frontend(extra = {}) {
    const context = vm.createContext({
        console, localStorage: { getItem: () => '[]', setItem() {} }, window: {}, ...extra
    });
    for (const file of ['spots-data.js', 'spot-spam-filter.js', 'spot-editor.js', 'spot-save.js']) {
        vm.runInContext(source(`scripts/${file}`), context);
    }
    return context;
}
const valid = {
    name: 'Testspot', description: 'Aussicht über den See', category: 'Nature',
    website: '', openedAt: 0
};

const cases = [
    ['nur Hauptkategorie (alte Anfrage)', {}, true],
    ['keine Zusatzkategorie', { additionalCategories: [] }, true],
    ['eine Zusatzkategorie', { additionalCategories: ['Landscape'] }, true],
    ['zwei Zusatzkategorien', { additionalCategories: ['Landscape', 'Wildlife'] }, true],
    ['Hauptkategorie fehlt', { category: '' }, false],
    ['nur optionale Kategorien', { category: '', additionalCategories: ['Nature'] }, false],
    ['unbekannte Hauptkategorie', { category: 'Unknown' }, false],
    ['drei Zusatzkategorien', { additionalCategories: ['Landscape', 'Wildlife', 'Astro'] }, false],
    ['Hauptkategorie doppelt', { additionalCategories: ['Nature'] }, false],
    ['Zusatzkategorie doppelt', { additionalCategories: ['Landscape', 'Landscape'] }, false],
    ['unbekannte Zusatzkategorie', { additionalCategories: ['Unknown'] }, false],
    ['leere Zusatzkategorie', { additionalCategories: [''] }, false],
    ['Zusatzkategorien als Text', { additionalCategories: 'Landscape' }, false],
    ['Zusatzkategorien als null', { additionalCategories: null }, false]
];

for (const [name, changes, accepted] of cases) {
    test(`Frontend: ${name}`, () => {
        assert.equal(frontend().validateNewSpotSubmission({ ...valid, ...changes }).valid, accepted);
    });
    test(`Edge Function: ${name}`, async () => {
        let handler;
        let inserted;
        const context = vm.createContext({
            console, Request, Response, URL, TextEncoder, crypto,
            Deno: { serve(fn) { handler = fn; }, env: { get: () => 'test-only' } },
            createClient() {
                return { from(table) {
                    const query = {
                        select() { return query; }, eq() { return query; },
                        gte() { return Promise.resolve({ data: [], error: null }); },
                        insert(value) {
                            if (table === 'spots') { inserted = value; return query; }
                            return Promise.resolve({ error: null });
                        },
                        single() { return Promise.resolve({ data: { id: 1, ...inserted }, error: null }); }
                    };
                    return query;
                } };
            }
        });
        const code = source('supabase/functions/create-spot/index.ts')
            .replace(/^import .*;\n/, '');
        vm.runInContext(stripTypeScriptTypes(code), context);
        const submission = { ...valid, ...changes };
        const response = await handler(new Request('http://localhost/create-spot', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...submission, additional_categories: submission.additionalCategories,
                latitude: 50, longitude: 8 })
        }));
        assert.equal(response.status, accepted ? 201 : 400);
        if (accepted) {
            assert.equal(inserted.active, false);
            assert.deepEqual(JSON.parse(JSON.stringify(inserted.additional_categories)),
                submission.additionalCategories || []);
        } else {
            assert.equal(inserted, undefined);
        }
    });
}

test('Filter findet Haupt- und Zusatzkategorien; alte Spots bleiben kompatibel', () => {
    const ctx = frontend();
    const spot = { category: 'Nature', additionalCategories: ['Landscape', 'Wildlife'] };
    for (const category of ['all', 'Nature', 'Landscape', 'Wildlife']) {
        assert.equal(ctx.spotMatchesCategory(spot, category), true);
    }
    assert.equal(ctx.spotMatchesCategory(spot, 'Astro'), false);
    assert.equal(ctx.spotMatchesCategory({ category: 'Nature' }, 'Nature'), true);
    assert.equal(ctx.getSpotCategories(spot).join(', '), 'Nature, Landscape, Wildlife');
});

function categoryEditor(spot = { category: '', additionalCategories: [] }) {
    const element = () => ({
        attributes: {}, children: [], value: '',
        focus() { this.focused = true; },
        addEventListener(event, fn) { this[event] = fn; },
        setAttribute(name, value) { this.attributes[name] = value; },
        append(child) { this.children.push(child); },
        replaceChildren() { this.children = []; }
    });
    const ctx = frontend({ document: { createElement: element } });
    const primary = element();
    const chips = element();
    const count = element();
    const picker = element();
    picker.options = ['', 'Nature', 'Landscape', 'Wildlife', 'Astro'].map(value => ({ value }));
    picker.append = option => picker.options.push(option);
    const extras = [element(), element()];
    const fields = {
        '.spot-category': primary, '.spot-category-chips': chips,
        '.spot-category-count': count, '.spot-category-picker': picker
    };
    ctx.setupSpotCategoryInputs({
        querySelector: selector => fields[selector], querySelectorAll: () => extras
    }, spot);
    return { primary, picker, chips, count, extras, spot,
        button: category => chips.children.find(button => button.textContent === category) };
}

test('Gemeinsames Dropdown erlaubt ein bis drei Tags, keine Duplikate und erneute Auswahl', () => {
    const { primary, picker, chips, count, extras, spot, button } = categoryEditor();
    assert.equal(primary.value, '');
    assert.equal(chips.hidden, true);
    assert.equal(picker.hidden, false);
    picker.value = 'Nature'; picker.change();
    assert.equal(primary.value, 'Nature');
    assert.equal(button('Nature').hidden, false);
    assert.equal(chips.hidden, false);
    assert.equal(spot.additionalCategories.length, 0);
    assert.equal(count.textContent, '1 von 3');
    picker.value = 'Landscape'; picker.change();
    assert.equal(count.textContent, '2 von 3');
    assert.equal(button('Landscape').hidden, false);
    assert.equal(picker.value, '');
    assert.equal(picker.options.find(option => option.value === 'Landscape').disabled, true);
    picker.value = 'Landscape'; picker.change();
    assert.equal(count.textContent, '2 von 3');
    picker.value = 'Wildlife'; picker.change();
    assert.equal(count.textContent, '3 von 3');
    assert.equal(picker.hidden, true);
    assert.equal(button('Astro').hidden, true);
    assert.equal(button('Wildlife').focused, true);
    picker.value = 'Astro'; picker.change();
    assert.equal(spot.additionalCategories.join(','), 'Landscape,Wildlife');
    assert.deepEqual(extras.map(input => input.value), ['Landscape', 'Wildlife']);
    button('Landscape').click();
    assert.equal(picker.hidden, false);
    assert.equal(button('Landscape').hidden, true);
    assert.equal(picker.focused, true);
    assert.equal(picker.options.find(option => option.value === 'Landscape').disabled, false);
    assert.deepEqual(extras.map(input => input.value), ['Wildlife', '']);
    button('Wildlife').click();
    assert.equal(count.textContent, '1 von 3');
    assert.deepEqual(extras.map(input => input.value), ['', '']);
    button('Nature').click();
    assert.equal(count.textContent, '0 von 3');
    assert.equal(primary.value, '');
    assert.equal(chips.hidden, true);
    assert.equal(picker.hidden, false);
    assert.deepEqual(extras.map(input => input.value), ['', '']);
});

test('Entfernen der ersten Kategorie erhält die übrigen und aktualisiert die Speicherfelder', () => {
    const { primary, picker, spot, button, extras, chips } = categoryEditor({
        category: 'Nature', additionalCategories: ['Landscape', 'Wildlife']
    });
    assert.equal(button('Landscape').hidden, false);
    button('Nature').click();
    assert.equal(primary.value, 'Landscape');
    assert.equal(spot.category, 'Landscape');
    assert.equal(spot.additionalCategories.join(','), 'Wildlife');
    assert.equal(button('Landscape').hidden, false);
    assert.equal(picker.options.find(option => option.value === 'Nature').disabled, false);
    assert.deepEqual(extras.map(input => input.value), ['Wildlife', '']);
    button('Landscape').click();
    assert.equal(primary.value, 'Wildlife');
    button('Wildlife').click();
    assert.equal(chips.hidden, true);
    assert.equal(spot.additionalCategories.length, 0);
    assert.deepEqual(extras.map(input => input.value), ['', '']);
});

test('Vorhandene Kategorien werden übernommen und ungültige oder doppelte Werte bereinigt', () => {
    const { spot, count } = categoryEditor({
        category: 'Nature', additionalCategories: ['Nature', 'Unknown', 'Wildlife', 'Wildlife', 'Astro']
    });
    assert.equal(spot.additionalCategories.join(','), 'Wildlife,Astro');
    assert.equal(count.textContent, '3 von 3');
});

test('Leere Auswahl nach Entfernen des letzten Tags verhindert das Speichern', async () => {
    const { primary, extras, button } = categoryEditor({ category: 'Nature' });
    button('Nature').click();
    const calls = [];
    const alerts = [];
    const ctx = frontend({
        supabaseClient: { functions: { invoke() { calls.push('unexpected'); } } },
        showScaporAlert(message) { alerts.push(message); }
    });
    const fields = {
        '.spot-name': { value: valid.name }, '.spot-description': { value: '' },
        '.spot-category': primary, '.spot-website': { value: '' },
        '.marker-form': { dataset: { openedAt: '0' } }
    };
    await ctx.saveSpot({ marker: { getPopup: () => ({ getElement: () => ({
        querySelector: selector => fields[selector], querySelectorAll: () => extras
    }) }) } });
    assert.equal(calls.length, 0);
    assert.deepEqual(alerts, ['Bitte wähle mindestens eine Kategorie aus.']);
});

test('Speichern überträgt beide Zusatzkategorien und berücksichtigt sie in der Mail', async () => {
    const calls = [];
    const ctx = frontend({
        supabaseClient: { functions: { async invoke(name, payload) {
            calls.push({ name, body: payload.body });
            return { data: name === 'create-spot' ? { spot: { id: 1 } } : { success: true } };
        } } },
        showScaporAlert() {}, removeActiveSpot() {}
    });
    const fields = {
        '.spot-name': { value: valid.name }, '.spot-description': { value: valid.description },
        '.spot-category': { value: 'Nature' }, '.spot-website': { value: '' },
        '.marker-form': { dataset: { openedAt: '0' } }, '.spot-save': {}
    };
    const element = {
        querySelector: selector => fields[selector],
        querySelectorAll: () => [{ value: 'Landscape' }, { value: 'Wildlife' }]
    };
    const spot = { marker: {
        getPopup: () => ({ getElement: () => element }), getLatLng: () => ({ lat: 50, lng: 8 })
    } };
    await ctx.saveSpot(spot);
    assert.equal(calls[0].name, 'create-spot');
    assert.equal(calls[0].body.additional_categories.join(','), 'Landscape,Wildlife');
    assert.equal(calls[1].body.spot.category, 'Nature, Landscape, Wildlife');
});
