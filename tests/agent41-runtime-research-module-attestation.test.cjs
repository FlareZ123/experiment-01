'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {sha256,attestLoadedResearchModules}=
  require('../simulation/evaluation/agent41-runtime-research-module-attestation.cjs');

test('native postgame runtime attestation retains dynamic and mismatched modules',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent41-runtime-attestation-'));
  try {
    fs.mkdirSync(path.join(root,'research'),{recursive:true});
    fs.mkdirSync(path.join(root,'vendor','twinleaf'),{recursive:true});
    const a=path.join(root,'research','pinned.cjs');
    const b=path.join(root,'research','dynamic.cjs');
    const c=path.join(root,'vendor','twinleaf','vendor.cjs');
    fs.writeFileSync(a,'module.exports=1;');
    fs.writeFileSync(b,'module.exports=2;');
    fs.writeFileSync(c,'module.exports=3;');
    const closure={files:[{path:'research/pinned.cjs',
      sha256:sha256(fs.readFileSync(a))}]};
    let attestation=attestLoadedResearchModules(root,closure,[a,b,c,a]);
    assert.equal(attestation.researchModuleCount,2);
    assert.equal(attestation.byStatus['matches-static-fingerprint'],1);
    assert.equal(attestation.byStatus['runtime-only'],1);
    assert.equal(attestation.dynamicallyLoadedModules[0].path,
      'research/dynamic.cjs');
    fs.writeFileSync(a,'module.exports=4;');
    attestation=attestLoadedResearchModules(root,closure,[a,b,c]);
    assert.equal(attestation.byStatus['changed-after-preflight'],1);
    assert.equal(attestation.changedDuringRun[0].path,'research/pinned.cjs');
  }finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
});

test('out-of-root and unrelated files never enter policy attestation',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent41-runtime-attestation-'));
  try{
    const other=fs.mkdtempSync(path.join(os.tmpdir(),'agent41-unrelated-'));
    try{
      const filename=path.join(other,'some.cjs');
      fs.writeFileSync(filename,'module.exports=7;');
      const attestation=attestLoadedResearchModules(root,{files:[]},[filename]);
      assert.equal(attestation.researchModuleCount,0);
      assert.equal(attestation.dynamicallyLoadedModules.length,0);
    }finally{fs.rmSync(other,{recursive:true,force:true});}
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
