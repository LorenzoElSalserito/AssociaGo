import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import test from 'node:test';
import {
    fetchManualDocument,
    getManualDocumentUrls,
    getManualLanguages
} from '../src/renderer/src/components/manualLoader.mjs';

test('normalizza locale regionale e mantiene fallback unici', () => {
    assert.deepEqual(getManualLanguages('fr-FR'), ['fr', 'it', 'en']);
    assert.deepEqual(getManualLanguages('it-IT'), ['it', 'en']);
    assert.deepEqual(getManualLanguages('xx'), ['it', 'en']);
});

test('genera URL relativi alla pagina Electron, non alla radice filesystem', () => {
    assert.deepEqual(
        getManualDocumentUrls('file:///opt/AssociaGo/resources/app.asar/out/renderer/index.html', 'de-DE', '01_intro.md'),
        [
            'file:///opt/AssociaGo/resources/app.asar/out/renderer/docs/de/01_intro.md',
            'file:///opt/AssociaGo/resources/app.asar/out/renderer/docs/it/01_intro.md',
            'file:///opt/AssociaGo/resources/app.asar/out/renderer/docs/en/01_intro.md'
        ]
    );
});

test('usa fallback italiano quando documento localizzato manca', async () => {
    const requested = [];
    const fetchFn = async (url) => {
        requested.push(url);
        return url.includes('/it/')
            ? { ok: true, text: async () => '# Manuale' }
            : { ok: false };
    };

    const content = await fetchManualDocument(
        fetchFn,
        'file:///app/out/renderer/index.html',
        'fr',
        '01_intro.md'
    );

    assert.equal(content, '# Manuale');
    assert.equal(requested.length, 2);
});

test('ogni lingua contiene tutti i 18 capitoli', async () => {
    const docsRoot = new URL('../src/renderer/public/docs/', import.meta.url);
    for (const language of ['de', 'en', 'es', 'fr', 'it']) {
        const files = (await readdir(new URL(`${language}/`, docsRoot)))
            .filter((file) => file.endsWith('.md'));
        assert.equal(files.length, 18, `capitoli mancanti per lingua ${language}`);
    }
});

test('indice del manuale coerente con file, titoli tradotti e struttura uguale in ogni lingua', async () => {
    const { readFile } = await import('node:fs/promises');
    const docsRoot = new URL('../src/renderer/public/docs/', import.meta.url);
    const source = await readFile(new URL('../src/renderer/src/components/ManualDashboard.jsx', import.meta.url), 'utf8');
    const chapters = [...source.matchAll(/id: '(\d\d_[a-z]+\.md)', title: '(manual\.chapters\.c\d\d)'/g)];
    assert.equal(chapters.length, 18);
    const outline = (markdown) => markdown.split('\n').filter((line) => /^#{1,3} /.test(line)).map((line) => line.match(/^#+/)[0].length).join('');
    const reference = {};
    for (const language of ['it', 'en', 'de', 'es', 'fr']) {
        const locale = JSON.parse(await readFile(new URL(`../src/renderer/src/locales/${language}.json`, import.meta.url), 'utf8'));
        for (const [, file, key] of chapters) {
            const title = key.split('.').reduce((value, part) => value?.[part], locale);
            assert.equal(typeof title, 'string', `${language}: titolo ${key}`);
            const markdown = await readFile(new URL(`${language}/${file}`, docsRoot), 'utf8');
            assert.match(markdown, /^# \S/, `${language}/${file}: H1 mancante`);
            reference[file] ??= outline(markdown);
            assert.equal(outline(markdown), reference[file], `${language}/${file}: struttura sezioni diversa dall'italiano`);
        }
    }
});
