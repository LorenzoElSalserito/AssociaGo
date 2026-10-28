import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const locales=['it','en','de','es','fr'];
const newKeys=['Are you sure you want to delete this volunteer?','Loading...','View Details','backupScope','Interface zoom','Donate to support','dataTransfer.title','dataTransfer.description','dataTransfer.template','dataTransfer.export','dataTransfer.file','dataTransfer.counts','databaseUi.saved','databaseUi.restartNotice','databaseUi.activeRemote','databaseUi.activeLocal','databaseUi.connected','databaseUi.test','databaseUi.dbHost','databaseUi.dbPort','databaseUi.dbName','databaseUi.dbUser','databaseUi.dbPassword','Association details','Administrator access','Remove association'];
for(const locale of locales) test(`New UI labels are translated in ${locale}`,()=>{
  const data=JSON.parse(fs.readFileSync(new URL(`../src/renderer/src/locales/${locale}.json`,import.meta.url)));
  for(const key of newKeys) {
    const value=data[key] || key.split('.').reduce((value,part)=>value?.[part],data);
    assert.equal(typeof value,'string',`${locale}: ${key}`);assert.ok(value.length>0);
  }
});

// Every literal t('key') used by the renderer must resolve in every locale.
const rendererRoot=new URL('../src/renderer/src/',import.meta.url);
const sourceFiles=fs.readdirSync(rendererRoot,{recursive:true}).filter(file=>/\.(jsx?|mjs)$/.test(file));
const usedKeys=new Set();
for(const file of sourceFiles) for(const line of fs.readFileSync(new URL(file,rendererRoot),'utf8').split('\n')) {
  if(line.trim().startsWith('//')) continue;
  for(const match of line.matchAll(/'(enum\.[A-Za-z]+\.[A-Za-z]+)'/g)) usedKeys.add(match[1]);
  for(const match of line.matchAll(/labelKey: '([\w.]+)'/g)) usedKeys.add(match[1]);
  for(const match of line.matchAll(/\bt\(\s*\w+ \? '([\w.]+)' : '([\w.]+)'\s*\)/g)) { usedKeys.add(match[1]); usedKeys.add(match[2]); }
  for(const match of line.matchAll(/\bt\(\s*(['"])((?:\\.|(?!\1).)+)\1\s*([,)+])/g)) if(match[3]!=='+') usedKeys.add(match[2].replace(/\\'/g,"'"));
}
const resolve=(data,key)=>{
  if(typeof data[key]==='string') return true;
  const parent=key.split('.').slice(0,-1).reduce((value,part)=>value?.[part],data), leaf=key.split('.').at(-1);
  const value=parent?.[leaf];
  return typeof value==='string' || typeof value?.['']==='string' || typeof parent?.[`${leaf}_other`]==='string';
};
for(const locale of locales) test(`Every renderer label resolves in ${locale}`,()=>{
  const data=JSON.parse(fs.readFileSync(new URL(`../src/renderer/src/locales/${locale}.json`,import.meta.url)));
  assert.deepEqual([...usedKeys].filter(key=>!resolve(data,key)),[]);
});

// A value equal to its own dotted key path is an untranslated placeholder.
for(const locale of locales) test(`No placeholder values in ${locale}`,()=>{
  const data=JSON.parse(fs.readFileSync(new URL(`../src/renderer/src/locales/${locale}.json`,import.meta.url)));
  const placeholders=[];
  const walk=(node,prefix)=>{for(const [key,value] of Object.entries(node)){const path=prefix?`${prefix}.${key}`:key; if(value&&typeof value==='object') walk(value,path); else if(/^[A-Za-z]+(\.[A-Za-z_]+)+$/.test(path)&&value===path) placeholders.push(path);}};
  walk(data,''); assert.deepEqual(placeholders,[]);
});
