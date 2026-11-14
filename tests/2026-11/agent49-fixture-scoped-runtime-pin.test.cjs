'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const Module=require('node:module');
const {
  fixtureRolePolicyCacheEntries,
  createFixtureRuntimePinEvidence,
  withFixtureScopedRolePin
}=require('../../simulation/evaluation/2026-11/agent49-fixture-scoped-runtime-pin.cjs');

function sha256(bytes){
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function withTempRepo(run){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent49-fixture-pin-'));
  const cleanup=()=>{
    for(const filename of Object.keys(require.cache)){
      const relative=path.relative(root,path.resolve(filename));
      if(relative && relative!=='..' && !relative.startsWith('..'+path.sep) &&
          !path.isAbsolute(relative)) delete require.cache[filename];
    }
    fs.rmSync(root,{recursive:true,force:true});
  };
  try{
    const files={
      'role-a.cjs':"module.exports=()=> 'A';\\n",
      'role-b.cjs':"module.exports=()=> 'B';\\n",
      'orchestrator.cjs':[
        "const a=require('./role-a.cjs');",
        "const b=require('./role-b.cjs');",
        "module.exports={run:()=>a()+b(),loadLate:()=>require('./late.cjs')};",
        ""
      ].join('\\n'),
      'late.cjs':"module.exports='late';\\n"
    };
    for(const [name,source] of Object.entries(files)){
      fs.writeFileSync(path.join(root,name),source);
    }
    const expected={
      'role-a.cjs':sha256(fs.readFileSync(path.join(root,'role-a.cjs'))),
      'role-b.cjs':sha256(fs.readFileSync(path.join(root,'role-b.cjs')))
    };
    const result=run({root,expected,files});
    if(result&&typeof result.then==='function') return result.finally(cleanup);
    cleanup();
    return result;
  }catch(error){
    cleanup();
    throw error;
  }
}

test('fixture preflight inventories only the exact preloaded role-policy closure',()=>{
  withTempRepo(({root,expected})=>{
    require(path.join(root,'orchestrator.cjs'));
    const entries=fixtureRolePolicyCacheEntries(root,expected);
    const filenames=entries.map(entry=>
      typeof entry==='string'?entry:entry.filename);
    assert.deepEqual(filenames.map(filename=>
      path.relative(root,filename).split(path.sep).join('/')).sort(),
    ['role-a.cjs','role-b.cjs']);
    assert.throws(()=>fixtureRolePolicyCacheEntries(root,{
      ...expected,'missing-role.cjs':sha256(Buffer.from('missing'))
    }),/every frozen candidate\/opponent role module must be preloaded/);
  });
});

test('fixture runtime evidence upgrades prepared role digests to V2 without claiming full closure',()=>{
  const prepared={
    runtimePinEvidence:{
      schema:'aichi-runtime-pin-evidence-v1',
      unionSha256:'a'.repeat(64),
      loadedProcessClosureSha256:'b'.repeat(64),
      cardPoolInitializationSha256:'c'.repeat(64)
    },
    runtimePinUnionSha256:'a'.repeat(64),
    loadedProcessClosureSha256:'b'.repeat(64),
    cardPoolInitializationSha256:'c'.repeat(64)
  };
  assert.deepEqual(createFixtureRuntimePinEvidence(prepared),{
    schema:'aichi-runtime-pin-evidence-v2',
    unionSha256:'a'.repeat(64),
    loadedProcessClosureSha256:'b'.repeat(64),
    cardPoolInitializationSha256:'c'.repeat(64),
    fullProcessClosureCovered:false
  });
  assert.throws(()=>createFixtureRuntimePinEvidence({
    ...prepared,runtimePinUnionSha256:'d'.repeat(64)
  }),/prepared runtime digest differs from its V1 evidence/);
  assert.throws(()=>createFixtureRuntimePinEvidence({
    ...prepared,runtimePinEvidence:{
      ...prepared.runtimePinEvidence,schema:'aichi-runtime-pin-evidence-v2'
    }
  }),/prepared V1 role-runtime evidence is required/);
});

test('fixture pin runs with role modules pinned, restores orchestration cache and marks scope non-admitting',()=>{
  withTempRepo(({root,expected})=>{
    const orchestratorPath=path.join(root,'orchestrator.cjs');
    const orchestrator=require(orchestratorPath);
    const orchestratorModule=require.cache[require.resolve(orchestratorPath)];
    const originalModuleLoad=Module._load;
    const result=withFixtureScopedRolePin(root,expected,()=>orchestrator.run());

    assert.equal(result.result,'AB');
    assert.equal(result.audit.guardRestored,true);
    assert.equal(result.audit.fixtureOnly,true);
    assert.equal(result.audit.scope,'fixture-role-policy-commonjs-closure-only');
    assert.equal(result.audit.rolePolicyClosureCovered,true);
    assert.equal(result.audit.fullProcessClosureCovered,false);
    assert.equal(result.audit.competitiveGameQualified,false);
    assert.deepEqual(result.audit.excludedPreloadedResearchFiles,['orchestrator.cjs']);
    assert.equal(result.audit.excludedPreloadedResearchFileCount,1);
    assert.strictEqual(Module._load,originalModuleLoad);
    assert.strictEqual(require.cache[orchestratorPath],orchestratorModule);
  });
});




test('fixture pin remains installed across an awaited worker-driven game callback',async()=>{
  await withTempRepo(async({root,expected})=>{
    const orchestratorPath=path.join(root,'orchestrator.cjs');
    const orchestrator=require(orchestratorPath);
    const orchestratorModule=require.cache[require.resolve(orchestratorPath)];
    const originalModuleLoad=Module._load;
    const result=await withFixtureScopedRolePin(root,expected,async()=>{
      await Promise.resolve();
      assert.notStrictEqual(Module._load,originalModuleLoad);
      return orchestrator.run();
    });
    assert.equal(result.result,'AB');
    assert.equal(result.audit.guardRestored,true);
    assert.equal(result.audit.fixtureOnly,true);
    assert.equal(result.audit.fullProcessClosureCovered,false);
    assert.strictEqual(Module._load,originalModuleLoad);
    assert.strictEqual(require.cache[orchestratorPath],orchestratorModule);
  });
});

test('fixture pin rejects a late unregistered research module and restores both guards and cache',()=>{
  withTempRepo(({root,expected})=>{
    const orchestratorPath=path.join(root,'orchestrator.cjs');
    const orchestrator=require(orchestratorPath);
    const orchestratorModule=require.cache[require.resolve(orchestratorPath)];
    const originalModuleLoad=Module._load;

    assert.throws(()=>withFixtureScopedRolePin(root,expected,
      ()=>orchestrator.loadLate()),
    /Unregistered research module before execution: late\.cjs/);

    assert.strictEqual(Module._load,originalModuleLoad);
    assert.strictEqual(require.cache[orchestratorPath],orchestratorModule);
  });
});
