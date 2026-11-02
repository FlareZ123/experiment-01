'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {BOUNDARY,normalizeNativePairOutput}=
  require('../simulation/evaluation/agent28-normalize-native-pair-json.cjs');

test('native GX diagnostic console is preserved beside valid atomic JSON',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent28-adp-evidence-'));
  try{
    const target=path.join(dir,'native.json');
    const notice='Used Altered Creation with Extra Water\n';
    const payload={attemptedArms:8,pairs:[{trialId:'test-only'}]};
    fs.writeFileSync(target,notice+BOUNDARY+JSON.stringify(payload)+'\n');
    assert.deepEqual(normalizeNativePairOutput(target),{
      alreadyClean:false,nativeLines:1,pairs:1});
    assert.deepEqual(JSON.parse(fs.readFileSync(target,'utf8')),payload);
    assert.equal(fs.readFileSync(path.join(dir,'native.native-console.log'),'utf8'),notice);
    assert.deepEqual(normalizeNativePairOutput(target),{
      alreadyClean:true,nativeLines:0,pairs:1});
    assert.equal(fs.existsSync(target+'.lock'),false);
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});

test('invalid or incomplete native mixed output cannot become valid evidence',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent28-adp-invalid-'));
  try{
    const target=path.join(dir,'native.json');
    fs.writeFileSync(target,'Used Altered Creation with Extra Water\n');
    assert.throws(()=>normalizeNativePairOutput(target),SyntaxError);
    assert.equal(fs.readFileSync(target,'utf8').startsWith('Used '),true);
    assert.equal(fs.existsSync(target+'.lock'),false);
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
