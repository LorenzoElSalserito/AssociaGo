/* Remote database journey: real Electron + real Spring Boot, SQLite -> MariaDB via Settings -> back to SQLite. No API mocks. */
const { _electron: electron, expect } = require('@playwright/test');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
assert.ok(process.env.ASSOCIAGO_E2E_DB_CONFIG, 'Set ASSOCIAGO_E2E_DB_CONFIG to a loopback MariaDB config (see UI_VERIFICATION.md)');
const remote = JSON.parse(fs.readFileSync(process.env.ASSOCIAGO_E2E_DB_CONFIG));
assert.ok(['127.0.0.1', 'localhost'].includes(remote.dbHost) && /^associago_e2e(?:_|$)/.test(remote.dbName), 'E2E requires a loopback MariaDB database named associago_e2e or associago_e2e_*');
// Optional: mariadb client + socket/args to inspect the remote schema directly.
const sqlClient = process.env.ASSOCIAGO_E2E_MARIADB_CLIENT ? process.env.ASSOCIAGO_E2E_MARIADB_CLIENT.split(' ') : null;
const artifacts = path.join(root, 'desktop/test-results/remote-db');
fs.mkdirSync(artifacts, { recursive: true });
const dataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'associago-remote-e2e-'));
const translate = JSON.parse(fs.readFileSync(path.join(root, 'desktop/src/renderer/src/locales/it.json')));
const t = key => key.split('.').reduce((value, segment) => value?.[segment], translate) || translate[key] || key;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
let app, backend, api, page, port, backendRun = 0;

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer().listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close(() => resolve(port)); });
    server.on('error', reject);
  });
}
async function request(endpoint, body, method = body ? 'POST' : 'GET') {
  const response = await fetch(`${api}${endpoint}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  assert.ok(response.ok, `${method} ${endpoint}: ${response.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
function sql(query) {
  return execFileSync(sqlClient[0], [...sqlClient.slice(1), '-N', '-B', remote.dbName, '-e', query], { encoding: 'utf8' }).trim();
}
async function startBackend() {
  const log = fs.openSync(path.join(artifacts, `backend-${++backendRun}.log`), 'w');
  backend = spawn('java', [`-Dassociago.data.path=${dataPath}`, '-jar', path.join(dataPath, 'backend.jar'), `--server.port=${port}`], { cwd: root, stdio: ['ignore', log, log] });
  api = null;
  for (let i = 0; i < 240 && !api; i++) {
    if (backend.exitCode !== null) throw new Error(`Backend exited: see backend-${backendRun}.log`);
    try { if ((await fetch(`http://127.0.0.1:${port}/api/associations`)).ok) api = `http://127.0.0.1:${port}/api`; } catch {}
    if (!api) await sleep(500);
  }
  assert.ok(api, 'Backend readiness timed out');
}
async function stopBackend() {
  const process = backend;
  if (!process || process.exitCode !== null) return;
  const exited = new Promise(resolve => process.once('exit', resolve));
  process.kill('SIGTERM');
  // Bound to this process: a stale timer must never kill the next backend.
  const timer = setTimeout(() => process.kill('SIGKILL'), 15000);
  await exited;
  clearTimeout(timer);
}
// Mirrors the user closing and reopening AssociaGo: backend restarts, renderer reloads.
async function reopen() {
  await stopBackend();
  await startBackend();
  await page.reload();
}
async function ready() {
  await expect(page.locator('.jl-content .spinner-border')).toHaveCount(0, { timeout: 20000 });
}
async function login(name, password) {
  await page.getByText(name, { exact: true }).click();
  await page.locator('input[type=password]').fill(password);
  await page.locator('button[type=submit]').click();
  await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 }); await ready();
}
async function nav(id) {
  await page.locator(`[data-nav-id="${id}"]`).click();
  await expect(page.locator('.jl-content')).toHaveAttribute('data-page', id); await ready();
}
async function openDatabaseSettings() {
  await nav('settings');
  await page.locator('.jl-content .nav-link').filter({ hasText: t('Database') }).click(); await ready();
}
const button = label => page.locator('.jl-content').getByRole('button', { name: t(label), exact: true });
async function check(name, callback) {
  try { await callback(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); throw error; }
}

async function main() {
  if (sqlClient) {
    // The dedicated database must start empty so the run proves a fresh remote install.
    const tables = execFileSync(sqlClient[0], [...sqlClient.slice(1), '-N', '-B', '-e', `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${remote.dbName}'`], { encoding: 'utf8' }).trim();
    assert.equal(tables, '0', `${remote.dbName} is not empty`);
  }
  const jar = fs.readdirSync(path.join(root, 'build/libs')).find(name => name.endsWith('.jar') && !name.includes('plain'));
  assert.ok(jar, 'Build backend with ./gradlew bootJar before running E2E');
  fs.copyFileSync(path.join(root, 'build/libs', jar), path.join(dataPath, 'backend.jar'));
  port = await freePort();
  await startBackend();

  const local = await request('/associations/setup', { name: 'Associazione Locale E2E', slug: 'locale-e2e', email: 'locale@example.invalid', password: 'Local-Only-Password42!', type: 'APS', taxCode: '12345678901' });
  app = await electron.launch({ args: ['--no-sandbox', path.join(__dirname, 'ui-electron.cjs')], env: { ...process.env, ASSOCIAGO_E2E_API: api, ASSOCIAGO_E2E_USER_DATA: path.join(dataPath, 'electron') }, timeout: 30000 });
  page = await app.firstWindow();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const network = [];
  page.on('requestfailed', request => network.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`));
  page.on('console', message => { if (message.type() === 'error') network.push(`console: ${message.text()}`); });
  process.on('exit', () => fs.writeFileSync(path.join(artifacts, 'network.log'), network.join('\n')));
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(assoc => {
    localStorage.clear();
    localStorage.setItem('associago_associations_list', JSON.stringify([{ id: assoc.id, nome: assoc.name, email: assoc.email, tipo: assoc.type }]));
    localStorage.setItem('associago_language', 'it');
  }, local);
  await page.reload();

  await check('Avvio su SQLite locale', async () => {
    assert.equal((await request('/v1/database')).activeType, 'sqlite');
    await login(local.name, 'Local-Only-Password42!');
    await openDatabaseSettings();
    await expect(page.locator('.jl-content .badge').filter({ hasText: t('databaseUi.activeLocal') })).toBeVisible();
  });

  await check('Impostazioni: credenziali errate rifiutate senza salvare', async () => {
    await page.locator('#useRemoteDb').check();
    await page.locator('[name=dbHost]').fill(remote.dbHost);
    await page.locator('[name=dbPort]').fill(String(remote.dbPort));
    await page.locator('[name=dbName]').fill(remote.dbName);
    await page.locator('[name=dbUser]').fill(remote.dbUser);
    await page.locator('[name=dbPassword]').fill('Wrong-Password');
    await button('databaseUi.test').click();
    await expect(page.locator('.jl-content .alert-danger')).toBeVisible();
    await button('Save Database Settings').click();
    await expect(page.locator('.jl-content .alert-danger')).toBeVisible();
    const saved = fs.existsSync(path.join(dataPath, 'config.json')) ? JSON.parse(fs.readFileSync(path.join(dataPath, 'config.json'))) : {};
    assert.notEqual(saved.dbType, 'MARIADB', 'Invalid remote config was saved');
    assert.ok(!(await page.locator('.jl-content .alert-danger').textContent()).includes('jdbc:'), 'JDBC URL leaked to UI');
  });

  await check('Impostazioni: verifica e salvataggio MariaDB', async () => {
    await page.locator('[name=dbPassword]').fill(remote.dbPassword);
    await button('databaseUi.test').click();
    await expect(page.locator('.jl-content .alert-success')).toContainText(t('databaseUi.connected'));
    await button('Save Database Settings').click();
    await expect(page.locator('.jl-content .alert-success')).toContainText(t('databaseUi.saved'));
    const saved = JSON.parse(fs.readFileSync(path.join(dataPath, 'config.json')));
    assert.equal(saved.dbType, 'MARIADB'); assert.equal(saved.dbName, remote.dbName);
    const state = await request('/v1/database');
    assert.equal(state.activeType, 'sqlite', 'Switch must wait for reopening');
    assert.equal(state.dbPassword, ''); assert.equal(state.hasPassword, true);
  });

  await check('Riapertura: backend attivo su MariaDB con schema migrato', async () => {
    await reopen();
    assert.equal((await request('/v1/database')).activeType, 'mariadb');
    if (sqlClient) {
      assert.ok(Number(sql('SELECT COUNT(*) FROM flyway_schema_history WHERE success=1')) > 0, 'No Flyway migration on MariaDB');
      assert.equal(sql('SELECT COUNT(*) FROM flyway_schema_history WHERE success=0'), '0');
    }
  });

  const remotePassword = 'Remote-Only-Password42!';
  await check('MariaDB vuoto: elenco locale ripulito e wizard di primo avvio', async () => {
    // The local association does not exist remotely, so the cached entry must be dropped.
    await expect(page.getByRole('heading', { name: t('Setup New Association') })).toBeVisible({ timeout: 20000 });
    const wizard = page.locator('form.ag-view');
    await wizard.locator('input[type=text]').first().fill('Associazione Remota E2E');
    await wizard.locator('input[type=text]').nth(1).fill('98765432109');
    await wizard.locator('input[type=email]').fill('remota@example.invalid');
    await wizard.locator('input[type=password]').fill(remotePassword);
    await wizard.locator('button[type=submit]').click();
    await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 }); await ready();
    if (sqlClient) assert.equal(sql("SELECT COUNT(*) FROM associations WHERE name='Associazione Remota E2E'"), '1');
  });

  await check('MariaDB: socio creato dalla UI persiste dopo riapertura', async () => {
    await nav('members');
    await button('Add Member').click();
    const modal = page.locator('.modal.show');
    await expect(modal).toBeVisible();
    await modal.locator('[name=firstName]').fill('Marta');
    await modal.locator('[name=lastName]').fill('Remoti');
    await modal.locator('[name=birthDate]').fill('1990-01-01');
    await modal.locator('[name=gender]').selectOption('F');
    await modal.locator('[name=taxCode]').fill('RMTMRT90A41H501X');
    await modal.locator('[name=email]').fill('marta@example.invalid');
    await modal.locator('button[type=submit]').click();
    await expect(modal).toHaveCount(0, { timeout: 15000 });
    await expect(page.locator('tbody tr').filter({ hasText: 'Marta' })).toHaveCount(1);
    await reopen();
    await login('Associazione Remota E2E', remotePassword);
    await nav('members');
    await expect(page.locator('tbody tr').filter({ hasText: 'Marta' })).toHaveCount(1);
  });

  await check('Ritorno a SQLite: dati locali intatti e separati', async () => {
    await openDatabaseSettings();
    await expect(page.locator('.jl-content .badge').filter({ hasText: t('databaseUi.activeRemote') })).toBeVisible();
    await page.locator('#useRemoteDb').uncheck();
    await button('Save Database Settings').click();
    await expect(page.locator('.jl-content .alert-success')).toContainText(t('databaseUi.saved'));
    await reopen();
    assert.equal((await request('/v1/database')).activeType, 'sqlite');
    const names = (await request('/associations')).map(a => a.name);
    assert.deepEqual(names, [local.name]);
    await page.evaluate(assoc => localStorage.setItem('associago_associations_list', JSON.stringify([{ id: assoc.id, nome: assoc.name, email: assoc.email, tipo: assoc.type }])), local);
    await page.reload();
    await login(local.name, 'Local-Only-Password42!');
  });

  await check('Nessuna eccezione JavaScript non gestita', async () => assert.deepEqual(errors, []));
}

main()
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => {
    fs.writeFileSync(path.join(artifacts, 'report.json'), JSON.stringify({ results }, null, 2));
    if (page) await page.screenshot({ path: path.join(artifacts, 'last.png') }).catch(() => {});
    if (app) await app.close().catch(() => {});
    await stopBackend().catch(() => {});
    fs.rmSync(dataPath, { recursive: true, force: true });
    console.log(`Report: ${path.join(artifacts, 'report.json')}`);
  });
