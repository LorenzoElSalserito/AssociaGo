/* First-run wizard: real Electron renderer + real Spring Boot on an empty, isolated SQLite. No API mocks. */
const { _electron: electron, expect } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const artifacts = path.join(root, 'desktop/test-results/setup-wizard');
fs.mkdirSync(artifacts, { recursive: true });
const dataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'associago-wizard-e2e-'));
const translate = JSON.parse(fs.readFileSync(path.join(root, 'desktop/src/renderer/src/locales/it.json')));
const t = key => key.split('.').reduce((value, part) => value?.[part], translate) || translate[key] || key;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
let app, backend, api;

async function check(name, callback) {
  try { await callback(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); throw error; }
}

async function main() {
  const backendLog = fs.openSync(path.join(artifacts, 'backend.log'), 'w');
  const jar = fs.readdirSync(path.join(root, 'build/libs')).find(name => name.endsWith('.jar') && !name.includes('plain'));
  assert.ok(jar, 'Build backend with ./gradlew bootJar before running E2E');
  const testJar = path.join(dataPath, 'backend.jar');
  fs.copyFileSync(path.join(root, 'build/libs', jar), testJar);
  backend = spawn('java', [`-Dassociago.data.path=${dataPath}`, '-jar', testJar, '--server.port=0'], { cwd: root, stdio: ['ignore', backendLog, backendLog] });
  const portFile = path.join(dataPath, 'config/connection.json');
  for (let i = 0; i < 180 && !api; i++) {
    if (backend.exitCode !== null) throw new Error('Backend exited: see backend.log');
    if (fs.existsSync(portFile)) {
      const candidate = JSON.parse(fs.readFileSync(portFile, 'utf8')).apiBaseUrl;
      try { if ((await fetch(`${candidate}/associations`)).ok) api = candidate; } catch {}
    }
    if (!api) await sleep(500);
  }
  assert.ok(api, 'Backend readiness timed out');

  app = await electron.launch({ args: ['--no-sandbox', path.join(__dirname, 'ui-electron.cjs')], env: { ...process.env, ASSOCIAGO_E2E_API: api, ASSOCIAGO_E2E_USER_DATA: path.join(dataPath, 'electron') }, timeout: 30000 });
  const page = await app.firstWindow();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('associago_language', 'it'); });
  await page.reload();

  const wizard = page.locator('form.ag-view');
  await check('Primo avvio: wizard creazione associazione visibile', async () => {
    await expect(page.getByRole('heading', { name: t('Setup New Association') })).toBeVisible();
    await expect(page.locator('.ag-wizard-section')).toHaveText([`1${t('Association details')}`, `2${t('Administrator access')}`]);
    // No cancel on first run: there is nothing to go back to.
    await expect(wizard.getByRole('button', { name: t('Cancel') })).toHaveCount(0);
  });

  await check('Wizard: animazioni concluse e layout stabile', async () => {
    await page.waitForFunction(() => document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).every(a => a.playState === 'finished'));
    const opacity = await page.locator('.login-card').evaluate(el => getComputedStyle(el).opacity);
    assert.equal(opacity, '1');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Horizontal overflow');
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1), 'Vertical overflow on first-run wizard');
    await page.screenshot({ path: path.join(artifacts, 'wizard-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'));
    await page.screenshot({ path: path.join(artifacts, 'wizard-dark.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'light'));
  });

  await check('Wizard: movimento ridotto disattiva animazioni', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const name = await page.locator('.login-card').evaluate(el => getComputedStyle(el).animationName);
    assert.equal(name, 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  await check('Wizard: codice fiscale non valido bloccato', async () => {
    await wizard.locator('input[type=text]').first().fill('Associazione Wizard E2E');
    await wizard.locator('input[type=text]').nth(1).fill('123');
    await wizard.locator('input[type=email]').fill('wizard@example.invalid');
    await wizard.locator('input[type=password]').fill('Wizard-Only-Password42!');
    await wizard.locator('button[type=submit]').click();
    await expect(page.locator('.alert-danger')).toBeVisible();
    assert.equal((await (await fetch(`${api}/associations`)).json()).length, 0, 'Association created with invalid fiscal code');
  });

  await check('Wizard: creazione reale e accesso all’app', async () => {
    await wizard.locator('input[type=text]').nth(1).fill('12345678901');
    await wizard.locator('button[type=submit]').click();
    await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 });
    const list = await (await fetch(`${api}/associations`)).json();
    assert.equal(list.length, 1);
    assert.equal(list[0].name, 'Associazione Wizard E2E');
  });

  await check('Ritorno: elenco associazioni usabile da tastiera', async () => {
    await page.reload();
    const choice = page.locator('.ag-choice').filter({ hasText: 'Associazione Wizard E2E' });
    await expect(choice).toBeVisible();
    await choice.focus();
    await page.keyboard.press('Enter');
    await page.locator('input[type=password]').fill('Wizard-Only-Password42!');
    await page.keyboard.press('Enter');
    await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 });
  });

  await check('Resta connesso: accesso automatico, poi Esci lo disattiva', async () => {
    const logout = async () => {
      await page.locator('.profile-avatar').click();
      await page.locator('.profile-dropdown-item').filter({ hasText: t('Logout') }).click();
    };
    await logout();
    const choice = page.locator('.ag-choice').filter({ hasText: 'Associazione Wizard E2E' });
    await choice.click();
    await page.locator('#rem').check();
    await page.locator('input[type=password]').fill('Wizard-Only-Password42!');
    await page.keyboard.press('Enter');
    await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 });
    await page.reload();
    await expect(page.locator('.jl-sidebar')).toBeVisible({ timeout: 20000 });
    await logout();
    await expect(choice).toBeVisible({ timeout: 20000 });
    await page.reload();
    await expect(choice).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.jl-sidebar')).toHaveCount(0);
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
