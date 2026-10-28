import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { messages, SUPPORTED_LANGUAGES, createTranslator, normalizeLanguage } from '../src/main/i18n.mjs';

const placeholders = value => [...value.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();

test('main-process dictionary covers all five languages with the same keys and placeholders', () => {
  assert.deepEqual(Object.keys(messages).sort(), [...SUPPORTED_LANGUAGES].sort());
  const reference = messages.it;
  for (const language of SUPPORTED_LANGUAGES) {
    assert.deepEqual(Object.keys(messages[language]).sort(), Object.keys(reference).sort(), language);
    for (const [key, value] of Object.entries(messages[language])) {
      assert.ok(typeof value === 'string' && value.trim().length > 0, `${language}:${key}`);
      assert.deepEqual(placeholders(value), placeholders(reference[key]), `${language}:${key}`);
    }
  }
});

test('every tr() key used by the main process exists', () => {
  const source = fs.readFileSync(new URL('../src/main/index.js', import.meta.url), 'utf8');
  const used = [...source.matchAll(/\btr\(\s*'([\w.]+)'/g)].map(match => match[1]);
  assert.ok(used.length > 10);
  assert.deepEqual(used.filter(key => !(key in messages.it)), []);
});

test('language resolution and interpolation', () => {
  assert.equal(normalizeLanguage('de-AT'), 'de');
  assert.equal(normalizeLanguage('EN_us'), 'en');
  assert.equal(normalizeLanguage('pt-BR'), null);
  const tr = createTranslator('ja');
  assert.equal(tr.getLanguage(), 'it');
  assert.equal(tr.setLanguage('fr-CA'), 'fr');
  assert.equal(tr.setLanguage('xx'), 'fr');
  assert.equal(tr('dialog.dbNotFound', { path: '/tmp/a.db' }), 'Base de données introuvable dans /tmp/a.db');
  assert.equal(tr('missing.key'), 'missing.key');
});
