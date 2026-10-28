/* New features through the real UI: coupons, event check-in, motion voting, notification bell, audit log, UI language. */
const { _electron: electron, expect } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const remoteConfig = process.env.ASSOCIAGO_E2E_DB_CONFIG ? JSON.parse(fs.readFileSync(process.env.ASSOCIAGO_E2E_DB_CONFIG)) : null;
if (remoteConfig) assert.ok(['127.0.0.1', 'localhost'].includes(remoteConfig.dbHost) && /^associago_e2e(?:_|$)/.test(remoteConfig.dbName), 'E2E requires a loopback MariaDB database named associago_e2e or associago_e2e_*');
const artifacts = path.join(root, remoteConfig ? 'desktop/test-results/features-mariadb' : 'desktop/test-results/features');
fs.mkdirSync(artifacts, { recursive: true });
const dataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'associago-features-e2e-'));
const locale = lang => JSON.parse(fs.readFileSync(path.join(root, `desktop/src/renderer/src/locales/${lang}.json`)));
const dictionaries = { it: locale('it'), en: locale('en') };
let lang = 'it';
const t = (key, vars = {}) => {
  const dict = dictionaries[lang];
  const value = key.split('.').reduce((v, part) => v?.[part], dict) ?? dict[key] ?? key;
  return String(typeof value === 'object' ? value[''] ?? key : value).replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? '');
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
let app, backend, api, page;

async function request(endpoint, body, method = body ? 'POST' : 'GET', headers = {}) {
  const response = await fetch(`${api}${endpoint}`, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  assert.ok(response.ok, `${method} ${endpoint}: ${response.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
async function check(name, callback) {
  try { await callback(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); await page?.screenshot({ path: path.join(artifacts, 'failure.png') }).catch(() => {}); throw error; }
}
const ready = () => expect(page.locator('.jl-content .spinner-border')).toHaveCount(0, { timeout: 20000 });
async function nav(id) {
  await page.locator(`[data-nav-id="${id}"]`).click();
  await expect(page.locator('.jl-content')).toHaveAttribute('data-page', id); await ready();
}
const content = () => page.locator('.jl-content');
const openDetail = async (id, title) => { await nav(id); await content().locator('tbody tr').filter({ hasText: title }).getByRole('button', { name: t('View Details'), exact: true }).click(); await ready(); };
const tab = label => content().locator('.nav-link').filter({ hasText: t(label) }).first().click();

async function main() {
  if (remoteConfig) fs.writeFileSync(path.join(dataPath, 'config.json'), JSON.stringify(remoteConfig));
  const log = fs.openSync(path.join(artifacts, 'backend.log'), 'w');
  const jar = fs.readdirSync(path.join(root, 'build/libs')).find(name => name.endsWith('.jar') && !name.includes('plain'));
  fs.copyFileSync(path.join(root, 'build/libs', jar), path.join(dataPath, 'backend.jar'));
  backend = spawn('java', [`-Dassociago.data.path=${dataPath}`, '-jar', path.join(dataPath, 'backend.jar'), '--server.port=0'], { cwd: root, stdio: ['ignore', log, log] });
  const portFile = path.join(dataPath, 'config/connection.json');
  for (let i = 0; i < 180 && !api; i++) {
    if (backend.exitCode !== null) throw new Error('Backend exited: see backend.log');
    if (fs.existsSync(portFile)) { const candidate = JSON.parse(fs.readFileSync(portFile, 'utf8')).apiBaseUrl; try { if ((await fetch(`${candidate}/associations`)).ok) api = candidate; } catch {} }
    if (!api) await sleep(500);
  }
  assert.ok(api, 'Backend readiness timed out');

  const assoc = await request('/associations/setup', { name: 'Circolo Funzioni E2E', slug: 'funzioni-e2e', email: 'funzioni@example.invalid', password: 'Features-Only-42!', type: 'APS', taxCode: '12345678901' });
  const h = { 'X-Association-Id': String(assoc.id) };
  const user = await request('/v1/users', { firstName: 'Giulia', lastName: 'Bianchi', email: 'giulia@example.invalid', taxCode: 'BNCGLI90A41H501X', birthDate: '1990-01-01', gender: 'F' });
  const membership = await request('/v1/memberships', { user: { id: user.id }, association: { id: assoc.id }, role: 'MEMBER', status: 'ACTIVE', joinDate: '2026-01-01' });
  await request('/v1/activities', { associationId: assoc.id, name: 'Corso di fotografia', category: 'COURSE', startDate: '2026-01-01', cost: 100, isActive: true });
  const event = await request('/v1/events', { associationId: assoc.id, name: 'Cena sociale', type: 'PARTY', startDatetime: '2027-11-20T19:00:00', status: 'PLANNED', costMember: 30, costNonMember: 40 });
  await request('/v1/coupons', { associationId: assoc.id, code: 'SOCI10', description: 'Sconto soci', discountType: 'PERCENTAGE', discountValue: 10, maxUses: 0, isActive: true });
  await request(`/v1/events/${event.id}/participants`, { event: { id: event.id }, user: { id: user.id } }, 'POST', h);
  const assembly = await request('/v1/assemblies', { associationId: assoc.id, title: 'Assemblea di primavera', date: '2027-04-20T18:00:00', type: 'ORDINARY', status: 'IN_PROGRESS' });
  await request(`/v1/assemblies/${assembly.id}/participants`, { assemblyId: assembly.id, userAssociationId: membership.id, participationType: 'PRESENT', role: 'MEMBER' });
  await request(`/v1/assemblies/${assembly.id}/motions`, { assemblyId: assembly.id, title: 'Approvazione bilancio', votingType: 'SIMPLE', orderNumber: 1 });

  app = await electron.launch({ args: ['--no-sandbox', path.join(__dirname, 'ui-electron.cjs')], env: { ...process.env, ASSOCIAGO_E2E_API: api, ASSOCIAGO_E2E_USER_DATA: path.join(dataPath, 'electron') }, timeout: 30000 });
  page = await app.firstWindow();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(a => {
    localStorage.clear();
    localStorage.setItem('associago_associations_list', JSON.stringify([{ id: a.id, nome: a.name, email: a.email, tipo: a.type }]));
    localStorage.setItem('associago_language', 'it');
  }, assoc);
  await page.reload();
  await page.getByText(assoc.name, { exact: true }).click();
  await page.locator('input[type=password]').fill('Features-Only-42!');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 }); await ready();

  await check('Coupon: verifica, sconto applicato e utilizzo conteggiato', async () => {
    await openDetail('activities', 'Corso di fotografia');
    await content().getByRole('button', { name: t('Add Participant'), exact: true }).click();
    const modal = page.locator('.modal.show');
    await modal.locator('select').first().selectOption({ index: 1 });
    await modal.getByLabel(t('couponApply.label')).fill('soci10');
    await modal.getByRole('button', { name: t('couponApply.apply'), exact: true }).click();
    await expect(modal).toContainText('90');
    await modal.locator('button[type=submit]').click();
    await expect(modal).toHaveCount(0);
    await expect(content().locator('tbody tr').filter({ hasText: 'Giulia' })).toContainText('90');
    const coupon = (await request(`/v1/coupons/association/${assoc.id}`)).find(c => c.code === 'SOCI10');
    assert.equal(coupon.currentUses, 1);
    await content().getByRole('button', { name: t('Add Participant'), exact: true }).click();
    await page.locator('.modal.show').getByLabel(t('couponApply.label')).fill('NONESISTE');
    await page.locator('.modal.show').getByRole('button', { name: t('couponApply.apply'), exact: true }).click();
    await expect(page.locator('.modal.show')).toContainText(t('couponApply.errors.COUPON_NOT_FOUND'));
    await page.keyboard.press('Escape');
  });

  await check('Eventi: check-in e annullamento aggiornano gli indicatori', async () => {
    await openDetail('events', 'Cena sociale');
    const toggle = content().locator('button[aria-pressed]').first();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const participant = (await request(`/v1/events/${event.id}/participants`))[0];
    assert.equal(participant.status, 'CHECKED_IN');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  await check('Assemblee: voto registrato con esito calcolato', async () => {
    await openDetail('assemblies', 'Assemblea di primavera');
    await expect(content().locator('tbody tr').filter({ hasText: 'Giulia' }).first()).toBeVisible();
    await tab('Motions');
    await content().locator('tbody tr').filter({ hasText: 'Approvazione bilancio' }).getByRole('button', { name: t('assemblyVoting.recordVote') }).click();
    const modal = page.locator('.modal.show');
    await modal.locator('#vote-votesInFavor').fill('1');
    await modal.locator('#vote-votesAgainst').fill('0');
    await modal.locator('#vote-votesAbstain').fill('0');
    await expect(modal).toContainText(t('assemblyVoting.outcome.APPROVED'));
    await modal.getByRole('button', { name: t('assemblyVoting.save'), exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(content().locator('tbody tr').filter({ hasText: 'Approvazione bilancio' })).toContainText(t('assemblyVoting.outcome.APPROVED'));
  });

  await check('Campanella: notifica dell’associazione apre l’evento', async () => {
    const bell = page.locator('.ag-notif-trigger');
    await expect(bell.locator('.ag-notif-badge')).toBeVisible({ timeout: 40000 });
    await bell.click();
    const item = page.locator('.ag-notif-item').first();
    await expect(item).toBeVisible();
    await item.click();
    await expect(content()).toHaveAttribute('data-page', 'events');
    const unread = await request('/v1/notifications/unread-count', null, 'GET', h);
    assert.ok(unread.count < 2, 'Notification not marked as read');
  });

  await check('Registro attività: operazioni registrate e filtrabili', async () => {
    await nav('settings');
    await tab('auditLog.tab');
    await ready();
    const rows = content().locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    assert.ok(await rows.count() > 0);
    const entries = await request(`/v1/audit?associationId=${assoc.id}&size=200`);
    const list = entries.content ?? entries;
    assert.ok(list.some(entry => entry.entityType && entry.action), 'No audit entries recorded');
  });

  await check('Lingua inglese: interfaccia ed errori del backend tradotti', async () => {
    await nav('settings');
    await page.evaluate(() => localStorage.setItem('associago_language', 'en'));
    await page.reload(); lang = 'en';
    await page.getByText(assoc.name, { exact: true }).click();
    await page.locator('input[type=password]').fill('Features-Only-42!');
    await page.locator('button[type=submit]').click();
    await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 }); await ready();
    await expect(page.locator('[data-nav-id="members"]')).toContainText(t('nav.members'));
    await nav('members');
    await content().getByRole('button', { name: t('Add Member'), exact: true }).click();
    await expect(page.locator('.modal.show')).toContainText(t('memberForm.birthDate'));
    await page.keyboard.press('Escape');
    const response = await fetch(`${api}/v1/database/test`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept-Language': 'en' }, body: JSON.stringify({ dbType: 'MARIADB', dbHost: '127.0.0.1', dbPort: '1', dbName: 'x', dbUser: 'x', dbPassword: 'x' }) });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.doesNotMatch(body.message, /\b(Connessione|database non|Verificare)\b/, `Backend message not localized: ${body.message}`);
  });

  await check('Nessuna eccezione JavaScript non gestita', async () => assert.deepEqual(errors, []));
}

main()
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => {
    fs.writeFileSync(path.join(artifacts, 'report.json'), JSON.stringify({ results }, null, 2));
    if (app) await app.close().catch(() => {});
    if (backend) backend.kill();
    fs.rmSync(dataPath, { recursive: true, force: true });
    console.log(`Report: ${path.join(artifacts, 'report.json')}`);
  });
