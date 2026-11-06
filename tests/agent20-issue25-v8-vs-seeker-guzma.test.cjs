'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const registration=require('../results/aichi-2026/registrations/agent20-issue25-v8-vs-seeker-guzma-retrospective-20261106.json');
const {
  VERSION,LAYER_VERSION,
  createVsSeekerRunner,runAgent20V8VsSeekerGuzma,writeJsonAtomically
}=require('../simulation/evaluation/agent20-issue25-v8-vs-seeker-guzma.cjs');

const layerVersion='agent48-owner-vs-seeker-guzma-layer-v1';
assert.equal(LAYER_VERSION,layerVersion);

test('runner enables the existing Agent43 continuation and preserves layer audit',()=>{
  let seenOptions=null,seenBase=null;
  const runner=createVsSeekerRunner({
    base:'C:/pinned/twinleaf/output',
    runDevelopment:options=>{
      seenOptions=options;
      return {rows:[],manifest:{development:true}};
    },
    withOwnerVsSeekerGuzmaLayer:(execute,options)=>{
      seenBase=options.base;
      return {
        result:execute(),
        audit:{version:layerVersion,rootsProposed:2,rootsAccepted:2}
      };
    }
  });
  const result=runner({actorOnlyComposition:true,actorGuzmaPromptContinuation:false});
  assert.equal(seenOptions.actorOnlyComposition,true);
  assert.equal(seenOptions.actorGuzmaPromptContinuation,true);
  assert.equal(seenBase,'C:/pinned/twinleaf/output');
  assert.equal(result.ownerVsSeekerGuzmaAudit.version,layerVersion);
  assert.equal(result.manifest.development,true);
});

test('retrospective runner retains the exact eight v8 contexts and no win-rate claim',()=>{
  const runV8=({runner})=>{
    const raw=runner({actorOnlyComposition:true,nativeRootActionLimit:128});
    return {manifest:{baseline:'v8'},diagnostic:{competitiveGamesQualified:0},
      rawDevelopment:raw};
  };
  const runDevelopment=options=>({
    rows:registration.trials.map(trial=>({
      trial:{...trial},
      actorOnlyDecisionCoverage:{guzmaPromptAudit:{acceptedGuzmaRoots:1}}
    })),
    manifest:{actorOnlyComposition:options.actorOnlyComposition},
    diagnostic:{competitiveGamesQualified:0}
  });
  const result=runAgent20V8VsSeekerGuzma({
    runV8,runDevelopment,
    withOwnerVsSeekerGuzmaLayer:(execute)=>({
      result:execute(),
      audit:{version:layerVersion,rootsProposed:1,rootsAccepted:1,
        promptsProposed:1,promptsAccepted:1,receipts:[]}
    })
  });
  assert.equal(result.manifest.version,VERSION);
  assert.equal(result.manifest.retrospective,true);
  assert.equal(result.manifest.unchangedPrintedSixties,true);
  assert.equal(result.rawDevelopment.rows.length,8);
  assert.deepEqual(result.rawDevelopment.rows.map(x=>x.trial.id).sort(),
    registration.trials.map(x=>x.id).sort());
  assert.equal(result.diagnostic.ownerVsSeekerGuzmaAudit.rootsAccepted,1);
  assert.equal(result.diagnostic.guzmaPromptAudits.length,8);
  assert.equal(result.diagnostic.competitiveGamesQualified,0);
  assert.equal(result.diagnostic.estimatedWinRate,null);
  assert.equal(result.diagnostic.winRateCertified,false);
});

test('JSON artifact writer uses an exclusive lock and atomic replacement',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent20-vs-seeker-'));
  try{
    const output=path.join(dir,'result.json');
    const written=writeJsonAtomically(output,{ok:true,attempts:8});
    assert.equal(written,output);
    assert.deepEqual(JSON.parse(fs.readFileSync(output,'utf8')),
      {ok:true,attempts:8});
    assert.equal(fs.existsSync(output+'.lock'),false);
    assert.equal(fs.readdirSync(dir).includes('result.json.'+process.pid+'.tmp'),false);
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});

test('registration remains explicitly retrospective and fixed to the original v8 cohort',()=>{
  assert.equal(registration.schema,
    'agent20-issue25-v8-vs-seeker-guzma-retrospective-128root-v1');
  assert.equal(registration.experimentalType.startsWith('retrospective'),true);
  assert.deepEqual(registration.trials.map(x=>x.id).sort(),
    ['1:212:B:champion-reference','1:212:B:new-moon-lockbreaker-v1',
      '3:213:A:champion-reference','3:213:A:new-moon-lockbreaker-v1',
      '6:210:B:champion-reference','6:210:B:new-moon-lockbreaker-v1',
      '11:211:A:champion-reference','11:211:A:new-moon-lockbreaker-v1'].sort());
});
