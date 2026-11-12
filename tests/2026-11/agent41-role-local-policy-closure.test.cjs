'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {
  captureRoleEntryManifest,installRoleLocalModuleLoadGuard
}=require('../../simulation/evaluation/2026-11/agent41-role-local-policy-closure.cjs');

function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent41-role-closure-'));
  const dir=path.join(root,'simulation');
  fs.mkdirSync(dir,{recursive:true});
  const write=(name,source)=>{
    const filename=path.join(dir,name);
    fs.writeFileSync(filename,source);
    return filename;
  };
  write('shared.cjs',"module.exports={value:'shared'};\n");
  write('candidate-only.cjs',"module.exports={value:'candidate-only'};\n");
  write('opponent-only.cjs',"module.exports={value:'opponent-only'};\n");
  write('candidate-late.cjs',"module.exports={value:'candidate-late'};\n");
  write('opponent-late.cjs',"module.exports={value:'opponent-late'};\n");
  write('unattributed.cjs',"module.exports={value:'unattributed'};\n");
  const candidate=write('candidate.cjs',`
    const shared=require('./shared.cjs');
    const own=require('./candidate-only.cjs');
    module.exports={
      shared,own,
      loadOpponent:()=>require('./opponent-only.cjs'),
      loadLate:()=>require('./candidate-late.cjs')
    };
  `);
  const opponent=write('opponent.cjs',`
    const shared=require('./shared.cjs');
    const own=require('./opponent-only.cjs');
    module.exports={
      shared,own,
      loadCandidate:()=>require('./candidate-only.cjs'),
      loadLate:()=>require('./opponent-late.cjs')
    };
  `);
  return {root,dir,candidate,opponent,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}

test('captures distinct transitive role closures and hashes JSON policy config',()=>{
  const f=fixture();
  try{
    require(f.candidate);
    require(f.opponent);
    const candidate=captureRoleEntryManifest({
      repositoryRoot:f.root,role:'candidate',
      entryFiles:['simulation/candidate.cjs'],
      config:{rootPolicy:'candidate-v1',decisionBudget:12}
    });
    const opponent=captureRoleEntryManifest({
      repositoryRoot:f.root,role:'opponent',
      entryFiles:['simulation/opponent.cjs'],
      config:{rootPolicy:'opponent-v1',decisionBudget:12}
    });
    assert.equal(candidate.manifest.complete,true);
    assert.equal(opponent.manifest.complete,true);
    assert.ok(candidate.allowedFiles.includes('simulation/candidate.cjs'));
    assert.ok(candidate.allowedFiles.includes('simulation/shared.cjs'));
    assert.ok(candidate.allowedFiles.includes('simulation/candidate-only.cjs'));
    assert.ok(!candidate.allowedFiles.includes('simulation/opponent-only.cjs'));
    assert.ok(opponent.allowedFiles.includes('simulation/opponent.cjs'));
    assert.ok(opponent.allowedFiles.includes('simulation/shared.cjs'));
    assert.ok(opponent.allowedFiles.includes('simulation/opponent-only.cjs'));
    assert.ok(!opponent.allowedFiles.includes('simulation/candidate-only.cjs'));
    assert.notEqual(candidate.sha256,opponent.sha256);
  }finally{f.cleanup();}
});

test('rejects callbacks and non-JSON runtime objects in role policy configuration',()=>{
  const f=fixture();
  try{
    require(f.candidate);
    assert.throws(()=>captureRoleEntryManifest({
      repositoryRoot:f.root,role:'candidate',
      entryFiles:['simulation/candidate.cjs'],
      config:{observe:()=>({})}
    }),/plain finite JSON/);
  }finally{f.cleanup();}
});

test('role-local loader guard blocks cross-role and post-freeze research modules',()=>{
  const f=fixture();
  try{
    const candidateModule=require(f.candidate);
    const opponentModule=require(f.opponent);
    const candidate=captureRoleEntryManifest({
      repositoryRoot:f.root,role:'candidate',
      entryFiles:['simulation/candidate.cjs'],config:{policy:'c'}
    });
    const opponent=captureRoleEntryManifest({
      repositoryRoot:f.root,role:'opponent',
      entryFiles:['simulation/opponent.cjs'],config:{policy:'o'}
    });
    const guard=installRoleLocalModuleLoadGuard({
      repositoryRoot:f.root,
      allowedByRole:{candidate: candidate.manifest,opponent:opponent.manifest}
    });
    try{
      assert.equal(guard.withRole('candidate',()=>candidateModule.shared.value),'shared');
      assert.equal(guard.withRole('opponent',()=>opponentModule.shared.value),'shared');
      assert.throws(()=>guard.withRole('candidate',()=>candidateModule.loadOpponent()),
        /Unmanifested research module for candidate/);
      assert.throws(()=>guard.withRole('opponent',()=>opponentModule.loadCandidate()),
        /Unmanifested research module for opponent/);
      assert.throws(()=>guard.withRole('candidate',()=>candidateModule.loadLate()),
        /Unmanifested research module for candidate/);
      assert.throws(()=>guard.withRole('opponent',()=>opponentModule.loadLate()),
        /Unmanifested research module for opponent/);
      assert.throws(()=>require(path.join(f.dir,'unattributed.cjs')),
        /outside an active policy role/);
      assert.equal(guard.withRole('candidate',()=>require('node:path').sep),path.sep);
    }finally{guard.restore();}
    assert.equal(candidateModule.loadLate().value,'candidate-late');
  }finally{f.cleanup();}
});
