import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as espree from 'espree';

// Fails when renderer code shows text that bypasses i18next.
const rendererRoot = new URL('../src/renderer/src/', import.meta.url);
const skipFiles = new Set(['manual-e2e.jsx', 'utils/Logger.js']);
const files = fs.readdirSync(rendererRoot, { recursive: true })
  .filter(file => /\.(jsx?|mjs)$/.test(file) && !skipFiles.has(file.replaceAll('\\', '/')));

// Brand names, product/technical tokens, language endonyms and key caps are not translated.
const allowed = new Set([
  'AssociaGo', 'PayPal', 'MariaDB', 'localhost', 'SHA-256:', 'Esc', 'Enter', 'Ctrl / ⌘ K', 'A4', 'A3',
  'IT', 'EN', 'ES', 'DE', 'FR', 'APS', 'ASD', 'ODV', 'ETS',
  'Italiano', 'English', 'Deutsch', 'Español', 'Français',
  'Electron v', 'Chromium v', 'Node v', 'Backend: v',
  'Copyright © Lorenzo De Marco (Lorenzo DM)', ': AGPLv3', 'www.lorenzodm.it'
]);
const textAttributes = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label']);
const hasWords = value => /\p{L}{2,}/u.test(value) && !allowed.has(value.trim());
const italian = /[àèéìòù]|\b(obbligatori[oa]|salva|annulla|caricamento|errore|socio|soci|associazione|seleziona|nessun[oa]?|riprova|verifica)\b/i;
const callee = node => node.type === 'Identifier' ? node.name
  : node.type === 'MemberExpression' ? `${callee(node.object)}.${node.property.name || ''}` : '';
const stringOf = node => node?.type === 'Literal' && typeof node.value === 'string' ? node.value
  : node?.type === 'TemplateLiteral' ? node.quasis.map(q => q.value.cooked).join(' ') : null;
// Values that end up rendered: the expression itself or a branch of ?:, || and ??.
const renderedStrings = node => {
  if (!node) return [];
  if (node.type === 'ConditionalExpression') return [...renderedStrings(node.consequent), ...renderedStrings(node.alternate)];
  if (node.type === 'LogicalExpression') return renderedStrings(node.right);
  if (node.type === 'BinaryExpression' && node.operator === '+') return [...renderedStrings(node.left), ...renderedStrings(node.right)];
  const value = stringOf(node);
  return value === null ? [] : [value];
};

const scan = (source, file) => {
  const findings = [];
  const ast = espree.parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, loc: true });
  const report = (node, kind, value) => findings.push(`${file}:${node.loc.start.line} ${kind}: ${JSON.stringify(value.trim())}`);
  const visit = (node, parent, ignored) => {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'CallExpression' && /^(t|i18n\.t|console\.\w+|logger\.\w+|Logger\.\w+)$/.test(callee(node.callee))) ignored = true;
    if (node.type === 'JSXElement' && node.openingElement.name.name === 'style') ignored = true;
    if (!ignored) {
      if (node.type === 'JSXText' && hasWords(node.value)) report(node, 'JSX text', node.value);
      if (node.type === 'JSXAttribute' && textAttributes.has(node.name.name)) {
        const value = node.value?.type === 'JSXExpressionContainer' ? renderedStrings(node.value.expression) : [stringOf(node.value)];
        for (const item of value) if (item !== null && hasWords(item)) report(node, node.name.name, item);
      }
      if (node.type === 'JSXExpressionContainer' && parent?.type !== 'JSXAttribute')
        for (const item of renderedStrings(node.expression)) if (hasWords(item)) report(node, 'JSX expression', item);
      if ((node.type === 'CallExpression' && /^(window\.)?(alert|confirm)$/.test(callee(node.callee)))
        || (node.type === 'NewExpression' && callee(node.callee) === 'Error' && file.endsWith('.jsx')))
        for (const item of renderedStrings(node.arguments[0])) if (hasWords(item)) report(node, callee(node.callee), item);
      if (node.type === 'Property' && ['required', 'message'].includes(node.key.name))
        for (const item of renderedStrings(node.value)) if (hasWords(item)) report(node, `${node.key.name} message`, item);
      const value = stringOf(node);
      if (value !== null && italian.test(value) && parent?.type !== 'ImportDeclaration') report(node, 'Italian literal', value);
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === 'loc' || key === 'range') continue;
      if (Array.isArray(child)) child.forEach(item => visit(item, node, ignored));
      else if (child && typeof child === 'object') visit(child, node, ignored);
    }
  };
  visit(ast, null, false);
  return findings;
};

test('renderer has no hard-coded user-visible text', () => {
  const findings = files.flatMap(file => scan(fs.readFileSync(new URL(file, rendererRoot), 'utf8'), file));
  assert.deepEqual(findings, []);
});

test('the scanner catches hard-coded text and accepts translated text', () => {
  const bad = `const A = ({ busy, e }) => <form>
    <label title="Nome">Cognome</label>
    <input placeholder="Via Roma 1" {...register('x', { required: 'Campo obbligatorio' })} />
    <button>{busy ? 'Salvataggio...' : t('Save')}</button>
    {e && alert('Failed: ' + e)}
  </form>;
  const msg = 'Errore di rete';`;
  assert.equal(scan(bad, 'bad.jsx').length, 8);
  const good = `const A = ({ busy }) => <form>
    <label title={t('Name')}>{t('Last Name')}</label>
    <input className="form-control" type="text" {...register('x', { required: t('Required') })} />
    <button>{busy ? t('Saving...') : t('Save')} AssociaGo</button>
  </form>;`;
  assert.deepEqual(scan(good, 'good.jsx'), []);
});
