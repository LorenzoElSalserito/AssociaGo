import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/renderer/src/api.js', import.meta.url), 'utf8');
let instance = 0;
async function client(getBackendInfo) {
  globalThis.window = { api: { getBackendInfo }, dispatchEvent() {} };
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${instance++}`);
  return module.associago;
}
const json = value => new Response(JSON.stringify(value), { headers: {'Content-Type':'application/json'} });
test('GET refreshes backend discovery after a stale port', async () => {
  let discovery = 0; const urls = [];
  const api = await client(async () => ({apiBaseUrl: `http://127.0.0.1:${++discovery === 1 ? 8001 : 8002}/api`}));
  globalThis.fetch = async url => { urls.push(url); if (url.includes('8001')) throw new TypeError('Failed to fetch'); return json([]); };
  assert.deepEqual(await api.members.getAll(), []);
  assert.equal(discovery, 2);
  assert.ok(urls[1].includes('8002'));
});
test('failed POST is never replayed and the next operation rediscovers connection', async () => {
  let calls = 0; let discovery = 0;
  const api = await client(async () => ({apiBaseUrl:`http://127.0.0.1:${8000 + ++discovery}/api`}));
  globalThis.fetch = async () => { calls++; throw new TypeError('Failed to fetch'); };
  await assert.rejects(api.users.create({firstName:'Test'}), error => error.code === 'BACKEND_UNREACHABLE' && error.message === 'errors.backendUnreachable');
  assert.equal(calls,1);
  globalThis.fetch = async () => json([]);
  await api.members.getAll(); assert.equal(discovery,2);
});
test('HTTP validation errors retain server message and do not retry', async () => {
  let calls = 0; const api = await client(async () => ({apiBaseUrl:'http://127.0.0.1:8000/api'}));
  globalThis.fetch = async () => { calls++; return new Response(JSON.stringify({message:'Invalid data'}),{status:400}); };
  await assert.rejects(api.users.create({}), /Invalid data/); assert.equal(calls,1);
});
test('theme preferences persist without replacing language', async () => {
  const data = new Map();
  globalThis.localStorage = {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
  const api = await client(async () => ({}));
  api.setPreferences({language:'fr',theme:'dark'}); api.setPreferences({theme:'light'});
  assert.equal(api.getPreferences().theme,'light'); assert.equal(api.getPreferences().language,'fr');
});
test('requests send the UI language as Accept-Language', async () => {
  const sent = [];
  globalThis.localStorage = {getItem:key=>key==='associago_language'?'de':null,setItem(){}};
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${instance++}`);
  globalThis.window = { api: { getBackendInfo: async () => ({apiBaseUrl:'http://127.0.0.1:8000/api'}) }, dispatchEvent() {} };
  globalThis.fetch = async (url, init) => { sent.push(init.headers['Accept-Language']); return json([]); };
  await module.associago.members.getAll(); assert.equal(sent.at(-1),'de');
  module.setRequestLanguage('fr');
  await module.associago.members.getAll(); assert.equal(sent.at(-1),'fr');
});
