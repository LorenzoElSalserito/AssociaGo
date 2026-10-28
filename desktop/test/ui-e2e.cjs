/* Real Electron renderer + real Spring Boot + isolated SQLite. No API mocks. */
const { _electron: electron, expect } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const remoteConfig = process.env.ASSOCIAGO_E2E_DB_CONFIG ? JSON.parse(fs.readFileSync(process.env.ASSOCIAGO_E2E_DB_CONFIG)) : null;
if(remoteConfig) assert.ok(['127.0.0.1','localhost'].includes(remoteConfig.dbHost) && /^associago_e2e(?:_|$)/.test(remoteConfig.dbName), 'E2E requires a loopback MariaDB database named associago_e2e or associago_e2e_*');
const artifacts = path.join(root, remoteConfig ? 'desktop/test-results/ui-mariadb' : 'desktop/test-results/ui');
fs.mkdirSync(artifacts, { recursive: true });
const dataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'associago-ui-e2e-'));
const results = [];
let app, backend, api, page;
const translate = JSON.parse(fs.readFileSync(path.join(root, 'desktop/src/renderer/src/locales/it.json')));
const t = key => key.split('.').reduce((value, segment) => value?.[segment], translate) || translate[key] || key;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(endpoint, body, method = body ? 'POST' : 'GET') {
  const response = await fetch(`${api}${endpoint}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  assert.ok(response.ok, `${method} ${endpoint}: ${response.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
async function check(name, callback) {
  try { await callback(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); throw error; }
}
async function ready() {
  await expect(page.locator('.jl-content .spinner-border')).toHaveCount(0, { timeout: 20000 });
  await expect(page.locator('.jl-page')).not.toBeEmpty();
}
async function nav(id) {
  await page.locator(`[data-nav-id="${id}"]`).click();
  await expect(page.locator('.jl-content')).toHaveAttribute('data-page', id);
  await ready();
}
function button(label, scope = page.locator('.jl-content')) { return scope.getByRole('button', { name: t(label), exact: true }); }
async function modal(label, scope) {
  await button(label, scope).click();
  if (label === 'Add Coupon') {
    await expect(page.locator('.jl-content form input').first()).toBeVisible();
    await button('Cancel').click();
  } else {
    await expect(page.locator('.modal.show')).toBeVisible();
    await expect(page.locator('.modal.show input, .modal.show select, .modal.show textarea').first()).toBeVisible();
    await page.locator('.modal.show .btn-close').click();
    await expect(page.locator('.modal.show')).toHaveCount(0);
  }
}

async function tabs(scope = page.locator('.jl-content')) {
  const labels = await scope.locator('.nav-tabs .nav-link').allTextContents();
  for (const label of labels) {
    await scope.locator('.nav-tabs .nav-link').filter({ hasText: label.trim() }).first().click();
    await ready();
    await expect(scope.locator('.nav-tabs .nav-link.active')).toContainText(label.trim());
  }
  return labels;
}
async function main() {
  if (remoteConfig) fs.writeFileSync(path.join(dataPath, 'config.json'), JSON.stringify(remoteConfig));
  const backendLog = fs.openSync(path.join(artifacts, 'backend.log'), 'w');
  const jar = fs.readdirSync(path.join(root, 'build/libs')).find(name => name.endsWith('.jar') && !name.includes('plain'));
  assert.ok(jar, 'Build backend with ./gradlew bootJar before running E2E');
  const testJar = path.join(dataPath, 'backend.jar');
  fs.copyFileSync(path.join(root, 'build/libs', jar), testJar);
  backend = spawn('java', [`-Dassociago.data.path=${dataPath}`, '-jar', testJar, '--server.port=0'], { cwd: root, stdio: ['ignore', backendLog, backendLog] });
  const portFile = path.join(dataPath, 'config/connection.json');
  for (let i = 0; i < 180; i++) {
    if (backend.exitCode !== null) throw new Error('Backend exited: see backend.log');
    if (fs.existsSync(portFile)) { const connection = JSON.parse(fs.readFileSync(portFile, 'utf8')); api = connection.apiBaseUrl; try { await request('/associations'); break; } catch {} }
    await sleep(500);
  }
  assert.ok(api, 'Backend readiness timed out');
  const assoc = await request('/associations/setup', { name: 'Fondazione Aurora E2E', slug: 'aurora-e2e', email: 'e2e@example.invalid', password: 'E2e-Only-Password42!', type: 'APS', taxCode: '12345678901' });
  const member = await request('/v1/members', { firstName: 'Elena', lastName: 'Verdi', email: 'elena@example.invalid', fiscalCode: 'VRDLNE90A41H501X', memberType: 'ORDINARY', memberCategory: 'ADULT' });
  const user = await request('/v1/users', { firstName: 'Elena', lastName: 'Verdi', email: 'elena@example.invalid', taxCode: 'VRDLNE90A41H501X', birthDate: '1990-01-01', gender: 'F' });
  const membership = await request('/v1/memberships', { user: { id: user.id }, association: { id: assoc.id }, role: 'MEMBER', status: 'ACTIVE', joinDate: '2026-01-01' });
  const activity = await request('/v1/activities', { associationId: assoc.id, name: 'Laboratorio cultura', category: 'COURSE', startDate: '2026-01-01', cost: 25, isActive: true });
  await request(`/v1/activities/${activity.id}/participants`, { user: { id: user.id }, registrationDate: '2026-01-01', isActive: true });
  const event = await request('/v1/events', { associationId: assoc.id, name: 'Incontro annuale', type: 'SOCIAL', startDatetime: '2027-11-20T18:00:00', endDatetime: '2027-11-20T20:00:00', status: 'PLANNED', costMember: 10, costNonMember: 20 });
  const assembly = await request('/v1/assemblies', { associationId: assoc.id, title: 'Assemblea ordinaria', date: '2027-11-21T18:00:00', type: 'ORDINARY', status: 'PLANNED' });
  const item = await request('/v1/inventory', { associationId: assoc.id, name: 'Proiettore', inventoryCode: 'INV-E2E', quantity: 2, status: 'AVAILABLE', condition: 'GOOD', currentValue: 200 });
  const volunteer = await request('/v1/volunteers', { memberId: member.id, skills: 'Accoglienza', status: 'ACTIVE' });
  await request('/v1/payment-methods', { associationId: assoc.id, name: 'Contanti E2E', type: 'CASH', active: true, hasCommission: false });
  const budget = await request('/v1/budgets', { associationId: assoc.id, title: 'Budget annuale E2E', year: 2026 });
  app = await electron.launch({ args: ['--no-sandbox', path.join(__dirname, 'ui-electron.cjs')], env: { ...process.env, ASSOCIAGO_E2E_API: api, ASSOCIAGO_E2E_USER_DATA: path.join(dataPath, 'electron') }, timeout: 30000 });
  page = await app.firstWindow();
  page.setDefaultTimeout(10000);
  const errors = [];
  const httpFailures = [];
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() >= 400 && !response.url().endsWith('/logo')) {
      httpFailures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(assoc => {
    localStorage.setItem('associago_associations_list', JSON.stringify([{ id: assoc.id, nome: assoc.name, email: assoc.email, tipo: assoc.type }]));
    localStorage.setItem('associago_language', 'it');
  }, assoc);
  await page.reload();
  await check('Accesso con password su backend reale', async () => {
    await page.getByText(assoc.name, { exact: true }).click();
    await page.locator('input[type=password]').fill('E2e-Only-Password42!');
    await page.locator('button[type=submit]').click();
    await expect(page.locator('.jl-sidebar')).toBeVisible(); await ready();
  });
  const routes = ['dashboard','members','activities','events','fiscal','assemblies','inventory','volunteers','attendance','coupons','budget','balance','certificates','communications','manual','settings'];
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.locator('.top-header').getByRole('button', { name: t('Dark'), exact: true }).click();
    for (const id of routes) await check(`Navigazione ${theme}: ${id}`, async () => {
      await nav(id);
      await expect(page.locator(`[data-nav-id="${id}"]`)).toHaveAttribute('aria-current', 'page');
      assert.equal(errors.length, 0, errors.join('\n'));
      assert.ok(await page.locator('.jl-content').evaluate(element => element.scrollWidth <= element.clientWidth + 2), 'Horizontal page overflow');
    });
    await nav('dashboard'); await page.screenshot({ animations: 'disabled', path: path.join(artifacts, `dashboard-${theme}.png`) });
    await nav('members'); await page.screenshot({ animations: 'disabled', path: path.join(artifacts, `members-${theme}.png`) });
  }
  await check('Tema persistente dopo reload e accesso', async () => {
    assert.equal(await page.evaluate(() => localStorage.getItem('associago_theme')), 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
    await page.getByText(assoc.name, { exact: true }).click();
    await page.locator('input[type=password]').fill('E2e-Only-Password42!'); await page.locator('button[type=submit]').click(); await ready();
  });
  await check('Navigazione compressa: tutte destinazioni accessibili', async () => {
    await page.locator('.jl-collapse-btn').click();
    for (const id of routes) await nav(id);
    await page.locator('.jl-collapse-btn').click();
  });
  await check('Palette: tutte destinazioni, tastiera, ricerca senza risultati', async () => {
    for (const id of routes) {
      await page.locator('.ag-search-trigger').click();
      await page.locator(`[data-command-id="${id}"]`).click();
      await expect(page.locator('.jl-content')).toHaveAttribute('data-page', id); await ready();
    }
    await page.keyboard.press('Control+k');
    await page.locator('.command-palette-modal input').fill('zzzzzz'); await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-command-id]')).toHaveCount(0);
    await page.keyboard.press('Escape');
  });
  await nav('dashboard');
  await check('Dashboard: tutti KPI, attività e azioni rapide', async () => {
    await expect(page.locator('.ag-dashboard-kpis .card')).toHaveCount(3);
    for (const id of ['members', 'fiscal', 'events']) {
      await page.locator('.ag-kpi-link').getByRole('button', { name: t(`nav.${id}`) }).click(); await ready();
      await expect(page.locator('.jl-content')).toHaveAttribute('data-page', id); await nav('dashboard');
    }
    await button('View All').click(); await expect(button('Less')).toHaveAttribute('aria-expanded', 'true'); await button('Less').click();
    await modal('Register New Member'); await modal('Create Event'); await button('Record Payment').click(); await ready();
    await expect(page.locator('.jl-content')).toHaveAttribute('data-page','fiscal');
  });
  for (const [id, label] of [['members','Add Member'], ['activities','Add Activity'], ['events','Add Event'], ['assemblies','New Assembly'], ['inventory','Add Item'], ['volunteers','Add Volunteer'], ['coupons','Add Coupon']]) {
    await check(`Apertura modulo: ${id}`, async () => { await nav(id); await modal(label); });
  }
  await check('Soci: modifica persistente e rinnovo senza duplicati', async () => {
    await nav('members'); const row = page.locator('tbody tr').filter({ hasText: 'Elena' });
    await row.getByRole('button', { name: t('Edit'), exact: true }).click();
    await expect(page.locator('.modal [name=firstName]')).toHaveValue('Elena');
    await page.locator('.modal [name=firstName]').fill('Elena aggiornata'); await page.locator('.modal button[type=submit]').click();
    await expect(page.locator('.modal.show')).toHaveCount(0); await expect(page.locator('tbody')).toContainText('Elena aggiornata');
    const all = await request(`/v1/memberships/association/${assoc.id}`); assert.equal(all.length, 1); assert.equal(all[0].user.firstName, 'Elena aggiornata');
    await page.locator('tbody tr').getByRole('button', { name: t('Renew Membership'), exact: true }).click();
    await expect.poll(async () => (await request(`/v1/memberships/${membership.id}`)).expirationDate).not.toBeNull();
  });
  for (const [id, title] of [['activities','Laboratorio cultura'],['events','Incontro annuale'],['assemblies','Assemblea ordinaria'],['inventory','Proiettore'],['volunteers','Elena Verdi']]) {
    await check(`Dettagli e schede: ${id}`, async () => {
      await nav(id); await page.locator('tbody tr').filter({ hasText: title }).getByRole('button',{ name:t('View Details'), exact:true }).click();
      await ready();
      const detailActions = {
        activities: [['Participants','Add Participant'],['Schedule','Add Schedule'],['Instructors','Add Instructor'],['Costs','Add Cost']],
        events: [['Participants','Add Participant']],
        assemblies: [['Participants','Register Presence'],['Motions','Add Motion'],['Documents','Add Document']],
        inventory: [['Loans History','Register Loan']],
        volunteers: [['Shifts','Add Shift'],['Expenses','Add Expense']]
      };
      for (const [tab, action] of detailActions[id]) {
        await page.locator('.jl-content .nav-link').filter({hasText:t(tab)}).click();
        await modal(action);
      }
      await tabs();
    });
  }
  await check('Assemblee, prestiti e turni: salvataggi reali', async () => {
    for (const [id, title, tab, action] of [
      ['assemblies','Assemblea ordinaria','Participants','Register Presence'],
      ['inventory','Proiettore','Loans History','Register Loan'],
      ['volunteers','Elena Verdi','Shifts','Add Shift']
    ]) {
      await nav(id);
      await page.locator('tbody tr').filter({hasText:title}).getByRole('button',{name:t('View Details'),exact:true}).click(); await ready();
      await page.locator('.jl-content .nav-link').filter({hasText:t(tab)}).click(); await button(action).click();
      if (id === 'volunteers') {
        await page.locator('.modal [name=startTime]').fill('2026-10-16T10:00');
        await page.locator('.modal [name=endTime]').fill('2026-10-16T12:00');
        await page.locator('.modal [name=description]').fill('Turno verificato');
      } else await page.locator('.modal [name=memberId]').selectOption(String(membership.id));
      await page.locator('.modal button[type=submit]').click();
      await expect(page.locator('.modal.show')).toHaveCount(0);
    }
    assert.equal((await request(`/v1/assemblies/${assembly.id}/participants`))[0].userAssociationId,membership.id);
    assert.equal((await request(`/v1/inventory/${item.id}/loans`))[0].userAssociationId,membership.id);
  });
  await check('Presenze: crea, registra, modifica, riapre ed elimina', async () => {
    await nav('attendance'); await button('attendanceUi.newSession').click();
    await page.locator('#session-date').fill('2026-10-16'); await page.locator('#session-startTime').fill('10:00'); await page.locator('#session-endTime').fill('11:00');
    await button('Save').click(); await expect(page.getByRole('status')).toContainText(t('attendanceUi.saved'));
    await page.getByRole('combobox', { name: 'Stato: Elena aggiornata Verdi' }).selectOption('PRESENT');
    const sessions = await request(`/v1/attendance/activity/${activity.id}`); assert.equal(sessions.length, 1);
    await expect.poll(async () => (await request(`/v1/attendance/session/${sessions[0].id}/records`))[0]?.status).toBe('PRESENT');
    await page.locator('#session-notes').fill('Sessione verificata'); await button('Save').click();
    await nav('dashboard'); await nav('attendance'); await expect(page.locator('tbody')).toContainText('Sessione verificata');
    await button('attendanceUi.manage').click(); await expect(page.getByRole('combobox', { name:'Stato: Elena aggiornata Verdi' })).toHaveValue('PRESENT');
    await nav('dashboard'); await nav('attendance'); await page.getByRole('button', {name:t('Delete'),exact:true}).click();
    await expect.poll(async () => (await request(`/v1/attendance/activity/${activity.id}`)).length).toBe(0);
  });
  await check('Impostazioni: schede, supporto, backup reale', async () => {
    await nav('settings'); await tabs();
    await page.locator('.nav-link').filter({hasText:t('General')}).click(); await ready();
    const support = page.getByTestId('support-associago');
    await expect(support).toHaveAttribute('href','https://www.paypal.com/paypalme/lorenzodemarco92');
    await support.click(); await expect.poll(() => app.evaluate(() => globalThis.lastExternalUrl)).toBe('https://www.paypal.com/paypalme/lorenzodemarco92');
    await button('Backup Now').click();
    await expect(page.locator('.alert-success').first()).toBeVisible();
    const backups = fs.readdirSync(path.join(dataPath,'backups')); assert.equal(backups.length,1);
    const backupBytes = fs.readFileSync(path.join(dataPath,'backups',backups[0]));
    if (remoteConfig) { const snapshot=JSON.parse(backupBytes); assert.equal(snapshot.database,'MariaDB'); assert.ok(snapshot.tables.find(table=>table.name==='users').rows.length>0); }
    else assert.equal(backupBytes.subarray(0,16).toString(),'SQLite format 3\u0000');
    await page.screenshot({ animations: 'disabled',path:path.join(artifacts,'settings-dark.png')});
  });
  await check('Economia, certificati, comunicazioni: tutte schede', async () => {
    for (const id of ['fiscal','certificates','communications']) { await nav(id); await tabs(); }
  });
  await check('Budget: dettaglio e righe', async () => { await nav('budget'); await page.getByText('Budget annuale E2E',{exact:true}).click(); await ready(); await expect(page.locator('.jl-content')).toContainText('Budget annuale E2E'); await modal('Add Line'); });
  await check('Moduli economia, bilancio, certificati e comunicazioni', async () => {
    for (const [id, labels] of [
      ['fiscal', ['New Transaction','Record Rent']],
      ['balance',['Compute Balance']],
      ['budget',['New Budget']],
      ['certificates',['New Template','Issue Certificate']]
    ]) { await nav(id); for (const label of labels) await modal(label); }
  });
  await check('PDF reali (report, ricevuta, confronto, verbale, attestati) e destinatari corretti', async () => {
    const downloadFrom=async (label,locator)=>{
      await app.evaluate(()=>{globalThis.lastDownload=null;});
      await locator.click();
      await expect.poll(()=>app.evaluate(()=>globalThis.lastDownload?.state),{message:`${label}: download not completed`,timeout:15000}).toBe('completed');
      const file=await app.evaluate(()=>globalThis.lastDownload.destination);
      assert.equal(fs.readFileSync(file).subarray(0,4).toString(),'%PDF',`${file} is not a PDF`);
    };
    await nav('activities'); await page.locator('tbody tr').filter({ hasText: 'Laboratorio cultura' }).getByRole('button',{ name:t('View Details'), exact:true }).click(); await ready();
    await downloadFrom('Report attività',button('Report'));
    await request('/v1/finance/transactions',{ associationId: assoc.id, date: new Date().toISOString().slice(0,10), amount: 15, type: 'INCOME', category: 'Quote', description: 'Ricevuta E2E' });
    await nav('fiscal');
    await downloadFrom('Report annuale',page.locator('.jl-content').getByRole('button',{ name:t('Annual Report'), exact:true }));
    await downloadFrom('Ricevuta',page.locator('tbody tr').filter({ hasText:'Ricevuta E2E' }).getByTitle(t('Download Receipt')));
    await page.locator('.jl-content .nav-link').filter({hasText:t('Custom Comparison')}).click();
    await downloadFrom('Confronto annuale',button('Export Comparison PDF'));
    await nav('assemblies'); await page.locator('tbody tr').filter({ hasText: 'Assemblea ordinaria' }).getByRole('button',{ name:t('View Details'), exact:true }).click(); await ready();
    await downloadFrom('Verbale assemblea',button('Minutes'));
    const template=await request('/v1/certificates/templates',{ associationId: assoc.id, name: 'Partecipazione E2E', type: 'PARTICIPATION', bodyHtml: '<p>{{firstName}} {{lastName}}</p>' });
    await nav('certificates'); await button('Issue Certificate').click();
    const dialog=page.locator('.modal.show');
    await dialog.locator('select').first().selectOption(String(template.id));
    await dialog.locator('#certificate-recipient').selectOption(String(user.id));
    await dialog.getByRole('button',{ name:t('Issue'), exact:true }).click();
    await expect(dialog).toHaveCount(0);
    await page.locator('.jl-content .nav-link').filter({hasText:t('Issued')}).click();
    const row=page.locator('tbody tr').filter({ hasText: 'Verdi' }).first();
    await expect(row).toBeVisible();
    await downloadFrom('PDF attestato',row.getByRole('button'));
    const batch=await request(`/v1/certificates/batch/activity/${activity.id}?templateId=${template.id}&associationId=${assoc.id}`,{});
    const participantUsers=(await request(`/v1/activities/${activity.id}/participants`)).filter(p=>(p.active ?? p.isActive)!==false && p.user).map(p=>p.user.id);
    assert.ok(batch.length>0 && batch.length===participantUsers.length,'Batch must issue one certificate per member participant');
    assert.deepEqual(batch.map(cert=>cert.userId).sort(),participantUsers.sort());
  });
  await check('Comunicazioni: messaggi e modelli raggiungibili', async () => {
    await nav('communications'); await modal('New Message');
    await page.locator('.jl-content .nav-link').filter({hasText:t('Templates')}).click(); await modal('New Template');
  });
  await check('Soci: ricerca e importazione CSV', async () => {
    await nav('members');
    const search = page.getByPlaceholder(t('Search members...'));
    await search.fill('nessun-socio'); await expect(page.locator('tbody')).not.toContainText('Elena');
    await search.fill('Elena'); await expect(page.locator('tbody')).toContainText('Elena');
    await button('Import CSV').click(); await expect(page.locator('.jl-content input[type=file]')).toBeVisible();
  });
  await check('CSV e JSON: esempi, anteprima, import, export e duplicati', async () => {
    const panel=page.getByTestId('member-data-transfer');
    const download=async id => {
      await app.evaluate(()=>{globalThis.lastDownload=null;});
      await page.getByTestId(id).click();
      await expect.poll(()=>app.evaluate(()=>globalThis.lastDownload?.state)).toBe('completed');
      return await app.evaluate(()=>globalThis.lastDownload.destination);
    };
    const jsonPath=await download('template-json');
    const json=JSON.parse(fs.readFileSync(jsonPath));
    json.rows[0].first_name='Èlisa'; json.rows[0].last_name='D’Amico'; json.rows[0].email='elisa@example.invalid';
    json.rows[0].notes='Accenti; virgolette "verificate"\nSeconda riga';
    fs.writeFileSync(jsonPath,JSON.stringify(json));
    const importFile=async (target, expectedSkipped=0) => {
      await panel.locator('input[type=file]').setInputFiles(target);
      await panel.getByRole('button',{name:t('Generate Preview'),exact:true}).click();
      await expect(panel.getByRole('status')).toContainText(t('Preview generated successfully.'));
      await panel.getByRole('button',{name:t('Confirm Import'),exact:true}).click();
      await expect(panel.getByRole('status')).toContainText(t('Import completed.'));
      if(expectedSkipped) await expect(panel.getByRole('status')).toContainText(`Duplicate: ${expectedSkipped}`);
    };
    await importFile(jsonPath);
    const exportPath=await download('export-json');
    const exported=JSON.parse(fs.readFileSync(exportPath));
    assert.deepEqual(exported.rows.find(row=>row.email==='elisa@example.invalid'),json.rows[0]);
    const csvPath=await download('template-csv'); await importFile(csvPath);
    const exportCsv=await download('export-csv'); await importFile(exportCsv,3);
    assert.equal((await request(`/v1/memberships/association/${assoc.id}`)).length,3);
    const invalid=path.join(dataPath,'invalid.json');json.rows[0].first_name='';fs.writeFileSync(invalid,JSON.stringify(json));
    await panel.locator('input[type=file]').setInputFiles(invalid);
    await panel.getByRole('button',{name:t('Generate Preview'),exact:true}).click();
    await expect(panel.getByRole('button',{name:t('Confirm Import'),exact:true})).toBeDisabled();
  });
  await check('Impostazioni: modifica profilo, metodi pagamento, firme e registri', async () => {
    await nav('settings'); await button('Edit Profile').click();
    await expect(page.locator('.jl-content input').first()).toBeEnabled();
    await button('Cancel').click();
    await page.locator('.jl-content .nav-link').filter({hasText:t('Finance')}).click(); await ready();
    await button('Add Method').click(); await expect(page.locator('input[name=name]')).toBeVisible(); await button('Cancel').click();
    for (const label of ['Registry','Signatures']) {
      await page.locator('.jl-content .nav-link').filter({hasText:t(label)}).click(); await ready();
      await expect(page.locator('.jl-content input').first()).toBeVisible();
    }
  });
  await check('Database: configurazione effettiva e credenziali protette', async () => {
    const state=await request('/v1/database'); assert.equal(state.activeType,remoteConfig?'mariadb':'sqlite'); assert.equal(state.dbPassword,'');
    await nav('settings'); await page.locator('.jl-content .nav-link').filter({hasText:t('Database')}).click(); await ready();
    if(remoteConfig) {
      await page.locator('[name=dbPassword]').fill(remoteConfig.dbPassword);
      await button('databaseUi.test').click();
      await expect(page.locator('.alert-success')).toContainText(t('databaseUi.connected'));
      const rejected=await fetch(`${api}/v1/database/test`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...remoteConfig,dbPassword:'Wrong-Password'})});
      assert.equal(rejected.status,400);
    }
    await button('Save Database Settings').click();
    await expect(page.locator('.alert-success')).toContainText(t('databaseUi.saved'));
    assert.equal(JSON.parse(fs.readFileSync(path.join(dataPath,'config.json'))).dbType,remoteConfig?'MARIADB':'SQLITE');
    const result=await request('/v1/database');assert.equal(result.dbPassword,'');
  });
  await check('Interruzione rete: avviso e recupero senza ricaricare app', async () => {
    await page.route('**/api/**', route => route.abort('connectionrefused'));
    await nav('dashboard');
    await expect(page.locator('.jl-main > .alert')).toBeVisible();
    await page.unroute('**/api/**');
    await page.locator('.jl-main > .alert').getByRole('button').click();
    await expect(page.locator('.jl-main > .alert')).toHaveCount(0);
    await button('Retry').click(); await expect(page.locator('.ag-dashboard-kpis')).toBeVisible();
  });
  await check('Schermo 1366×768 e 1280×720: navigazione senza perdita destinazioni', async () => {
    for (const [width,height] of [[1366,768],[1280,720]]) {
      await app.evaluate(({BrowserWindow}, size) => BrowserWindow.getAllWindows()[0].setSize(...size), [width,height]);
      for (const id of routes) await nav(id);
      await nav('dashboard'); await page.screenshot({ animations: 'disabled',path:path.join(artifacts,`dashboard-${width}.png`)});
    }
  });
  await check('Nessuna eccezione JavaScript non gestita', async () => assert.deepEqual(errors, []));
  await check('Nessun errore HTTP inatteso nelle funzioni visitate', async () => assert.deepEqual(httpFailures, []));
  await check('Zoom: sette livelli, navigazione e persistenza', async () => {
    await nav('settings'); await page.locator('.nav-link').filter({hasText:t('General')}).click(); await ready();
    for (const zoom of [50,75,100,125,150,175,200]) {
      await page.locator('#interface-zoom').selectOption(String(zoom));
      await expect.poll(() => app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].webContents.getZoomFactor())).toBeCloseTo(zoom/100, 5);
    }
    for (const id of routes) await nav(id);
    await nav('settings'); await page.locator('.nav-link').filter({hasText:t('General')}).click(); await ready();
    await expect(page.locator('#interface-zoom')).toHaveValue('200');
    await page.screenshot({animations:'disabled',path:path.join(artifacts,'zoom-200.png')});
    await page.locator('#interface-zoom').selectOption('100');
    await page.emulateMedia({reducedMotion:'reduce'});
    await nav('dashboard');
    assert.equal(await page.locator('.fade-in').first().evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await check('Profilo: informazioni, donazione e logout', async () => {
    await page.locator('.profile-avatar').click(); await page.locator('.profile-dropdown-item').filter({hasText:t('App Info')}).click();
    await expect(page.locator('.modal-title')).toContainText(t('App Info')); await expect(page.getByTestId('donate-app-info')).toHaveAttribute('href','https://www.paypal.com/paypalme/lorenzodemarco92');
    await page.getByTestId('donate-app-info').click();
    await expect.poll(()=>app.evaluate(()=>globalThis.lastExternalUrl)).toBe('https://www.paypal.com/paypalme/lorenzodemarco92');
    await page.locator('.modal .btn-close').click();
    await page.locator('.profile-avatar').click(); await page.locator('.profile-dropdown-item').filter({hasText:t('Logout')}).click();
    await expect(page.locator('.ag-login')).toBeVisible();
  });
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (page && process.exitCode) await page.screenshot({ animations: 'disabled',path:path.join(artifacts,'failure.png')}).catch(()=>{});
  fs.writeFileSync(path.join(artifacts,'report.json'), JSON.stringify({date:new Date().toISOString(), dataPath, results},null,2));
  if (app) await app.close();
  if (backend) backend.kill('SIGTERM');
  console.log(`Report: ${artifacts}/report.json`);
});
