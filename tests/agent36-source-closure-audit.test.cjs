'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {auditSourceClosure,missingReviewedKeys}=require('../simulation/evaluation/agent36-source-closure-audit.cjs');
/** @param {string} file @param {string} content */
function write(file,content){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);}
test('tracks imported option reads and code changes',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent36-source-audit-'));
  try {
    const entry=path.join(root,'entry.cjs'),dependency=path.join(root,'sub/actor.cjs');
    write(entry,"require('./sub/actor.cjs'); const a=process.env.ENTRY_OPTION;");
    write(dependency,'module.exports=process.env.HIDDEN_OPTION;');
    const first=auditSourceClosure(root,['entry.cjs']);
    assert.deepEqual(first.keys,['ENTRY_OPTION','HIDDEN_OPTION']);
    assert.deepEqual(missingReviewedKeys(first,{ENTRY_OPTION:undefined}),['HIDDEN_OPTION']);
    write(dependency,'module.exports=process.env.HIDDEN_OPTION === true;');
    assert.notEqual(auditSourceClosure(root,['entry.cjs']).digest,first.digest);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
test('reports dynamic imports and computed environmental settings',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent36-source-dynamic-'));
  try {
    write(path.join(root,'entry.cjs'),"require(path.join(__dirname, 'dynamic.cjs')); const p=process.env['COMPUTED'];");
    const result=auditSourceClosure(root,['entry.cjs']);
    assert.equal(result.limitations.dynamicRequireSites.length,1);
    assert.equal(result.limitations.computedEnvSites.length,1);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});

test('destructured process environment reads are retained as unresolved',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent36-source-destructured-'));
  try {
    write(path.join(root,'entry.cjs'),"const {UNTRACKED}=process.env; module.exports=UNTRACKED;");
    const audit=auditSourceClosure(root,['entry.cjs']);
    assert.deepEqual(audit.keys,[]);
    assert.equal(audit.limitations.unclassifiedEnvSites.length,1);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
