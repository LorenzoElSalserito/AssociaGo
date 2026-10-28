const { _electron: electron, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const dataPath = process.env.ASSOCIAGO_STARTUP_DATA_PATH || fs.mkdtempSync(path.join(os.tmpdir(), 'associago-startup-'));
const assert=require('node:assert/strict');
assert.ok(path.resolve(dataPath).startsWith(path.join(os.tmpdir(),'associago-')),'Startup tests require an isolated AssociaGo temporary folder');
let app;
(async () => {
  if(process.env.ASSOCIAGO_E2E_DB_CONFIG) fs.copyFileSync(process.env.ASSOCIAGO_E2E_DB_CONFIG,path.join(dataPath,'config.json'));
  app = await electron.launch({ args: ['--no-sandbox', path.join(__dirname, '..')], env: {...process.env, ASSOCIAGO_DATA_PATH: dataPath, ASSOCIAGO_MANAGED_BACKEND:'1'}, timeout: 90000 });
  await expect.poll(async () => {
    for (const window of app.windows()) if (await window.locator('.ag-login').count()) return true;
    return false;
  }, {timeout:90000}).toBe(true);
  const renderer=app.windows().find(window=>!window.url().includes('splash'));
  await renderer.evaluate(()=>localStorage.setItem('associago_zoom','150'));
  await renderer.reload();
  await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(window=>!window.webContents.getURL().includes('splash')).webContents.getZoomFactor())).toBeCloseTo(1.5,5);
  const invalidZoom=await renderer.evaluate(async()=>{try {await window.api.setZoom(225);return false;} catch {return true;}});
  assert.equal(invalidZoom,true);
  await renderer.evaluate(async()=>{localStorage.setItem('associago_zoom','100');await window.api.setZoom(100);});
  const config = JSON.parse(fs.readFileSync(path.join(dataPath,'config/connection.json')));
  const response = await fetch(config.healthUrl);
  if (!response.ok) throw new Error('Spawned backend is unhealthy');
  if(process.env.ASSOCIAGO_STARTUP_DATA_PATH) {
    const associations=await (await fetch(`${config.apiBaseUrl}/associations`)).json();
    const assoc=associations.find(row=>row.name==='Fondazione Aurora E2E');
    await renderer.getByText('Fondazione Aurora E2E',{exact:true}).click();
    await renderer.locator('input[type=password]').fill('E2e-Only-Password42!');await renderer.locator('button[type=submit]').click();
    await expect(renderer.locator('.jl-sidebar')).toBeVisible();
    await renderer.locator('[data-nav-id=settings]').click();await renderer.locator('.nav-link').filter({hasText:'Generale'}).click();
    await renderer.locator('#interface-zoom').selectOption('200');
    await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.getZoomFactor())).toBeCloseTo(2,5);
    assert.ok(await renderer.locator('.jl-main').evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1));
    const capture=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].capturePage()).toPNG().toString('base64'));
    fs.writeFileSync(path.join(dataPath,'zoom-200-native.png'),Buffer.from(capture,'base64'));
    await renderer.locator('#interface-zoom').selectOption('100');

    assert.ok(assoc,'Data was not preserved across restart');
    const members=await (await fetch(`${config.apiBaseUrl}/v1/memberships/association/${assoc.id}`)).json();
    assert.equal(members.length,3);
    const request=async (endpoint,body,method=body?'POST':'GET')=>{
      const res=await fetch(config.apiBaseUrl+endpoint,{method,headers:{'Content-Type':'application/json','X-Association-Id':String(assoc.id)},body:body?JSON.stringify(body):undefined});
      assert.ok(res.ok,`${method} ${endpoint}: ${res.status} ${await res.clone().text()}`);
      const text=await res.text();return text?JSON.parse(text):null;
    };
    const bytes=fs.readFileSync(path.join(__dirname,'../src/renderer/src/assets/brand-mark.png'));
    const upload=async endpoint=>{const form=new FormData();form.append('file',new Blob([bytes],{type:'image/png'}),'brand.png');const res=await fetch(config.apiBaseUrl+endpoint,{method:'POST',body:form});assert.ok(res.ok,await res.text());};
    await upload(`/associations/${assoc.id}/logo`);
    assert.deepEqual(Buffer.from(await (await fetch(`${config.apiBaseUrl}/associations/${assoc.id}/logo`)).arrayBuffer()),bytes);
    const signature=await request('/v1/signatures',{associationId:assoc.id,signerRole:'PRESIDENT',signerName:'Èlisa D’Amico',signerTitle:'Presidente'});
    await upload(`/v1/signatures/${signature.id}/image`);
    assert.deepEqual(Buffer.from(await (await fetch(`${config.apiBaseUrl}/v1/signatures/${signature.id}/image`)).arrayBuffer()),bytes);
    const exportedMembers=await request(`/v1/data/members/export?associationId=${assoc.id}&format=json`);
    fs.writeFileSync(path.join(dataPath,'verified-members.json'),JSON.stringify(exportedMembers,null,2));
    for(const transaction of await request('/v1/finance/transactions')) if(transaction.description==='Precisione decimale') await request(`/v1/finance/transactions/${transaction.id}`,null,'DELETE');
    const first=await request('/v1/finance/transactions',{associationId:assoc.id,type:'INCOME',date:'2026-10-16',amount:'0.10',description:'Precisione decimale'});
    const second=await request('/v1/finance/transactions',{associationId:assoc.id,type:'INCOME',date:'2026-10-16',amount:'0.20',description:'Precisione decimale'});
    const dashboard=await request('/v1/dashboard/stats');assert.equal(dashboard.treasury.balance,0.30);
    await request(`/v1/finance/transactions/${first.id}`,null,'DELETE');await request(`/v1/finance/transactions/${second.id}`,null,'DELETE');
    await request(`/v1/fiscal/invoice-check?associationId=${assoc.id}&year=2026&userId=${members[0].user.id}`,{});
    if(process.env.ASSOCIAGO_CROSS_DB_JSON) {
      const source=JSON.parse(fs.readFileSync(process.env.ASSOCIAGO_CROSS_DB_JSON));
      const target=await request('/associations/setup',{name:'Interoperabilità',slug:'cross-'+Date.now(),email:'cross@example.invalid',password:'E2e-Cross42!',type:'APS'});
      const form=new FormData();form.append('file',new Blob([JSON.stringify(source)],{type:'application/json'}),'cross.json');
      const response=await fetch(`${config.apiBaseUrl}/v1/data/members/import?associationId=${target.id}`,{method:'POST',body:form});assert.ok(response.ok,await response.clone().text());assert.equal((await response.json()).importedRows,3);
      const exported=await request(`/v1/data/members/export?associationId=${target.id}&format=json`);
      const sort=rows=>rows.sort((a,b)=>a.email.localeCompare(b.email));assert.deepEqual(sort(exported.rows),sort(source.rows));
    }
    console.log('PASS persistence, binary assets, decimal accounting, invoice checks, data interoperability');
  }
  const database=await (await fetch(`${config.apiBaseUrl}/v1/database`)).json();
  const result={result:'PASS', scenario:'Managed backend startup, native zoom and available persistence checks', database:database.activeType, dataPath, port:config.port, crossDatabaseImport:!!process.env.ASSOCIAGO_CROSS_DB_JSON};
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,`../test-results/startup-${database.activeType}.json`),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
})().catch(error => {console.error(error);process.exitCode=1;}).finally(async()=>{if(app) await app.close();});
